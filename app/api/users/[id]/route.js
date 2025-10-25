// app/api/users/[id]/route.js
import connectDB from '../../../../lib/db';
import User from '../../../../lib/models/User';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import path from 'path';
import { uploadFile, getFileUrl } from '../../../../lib/localStorage.js';

// app/api/users/[id]/route.js
// ... (rest of your imports and code)

// Updated uploadToLocal function
async function uploadToLocal(file, prefix = 'photo', memberId = null, uniqueId = null) {
  const folder = prefix === 'logo' ? 'companylogos' : 'profileimages';
  const imageType = prefix === 'logo' ? 'logo' : 'profile';
  
  try {
    const fileUrl = await uploadFile(file, folder, memberId, uniqueId, imageType);
    return fileUrl; // Return the public URL path
  } catch (error) {
    console.error('Local Upload Error:', error);
    throw new Error(`Local Upload failed: ${error.message}`);
  }
}

// In your PATCH handler, when setting updateData[key] = await uploadToLocal(value, key);
// This will now store the key (e.g., '/api/files/profileimages/MEM001-UNQ12345-PROFILE.jpg') in user.photo or user.logo

// app/api/users/[id]/route.js
// ... (rest of your code)

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // ⚡ Next.js 15 requires params to be awaited
  const { id } = await params;

  // const isAdmin = session.user.role === 'admin';
  // const isSelf = session.user.id === id.toString();
  // if (!isAdmin && !isSelf) {
  //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  // }

  try {
    await connectDB();
    const user = await User.findById(id).select('-password');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Generate local URLs for photo and logo if they exist
    if (user.photo) {
      user.photo = getFileUrl(user.photo);
    }

    if (user.logo) {
      user.logo = getFileUrl(user.logo);
    }

    // Add caching headers for better performance
    const response = NextResponse.json(user);
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  // Ensure database connection
  await connectDB();

  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ⚡ Next.js 15 requires params to be awaited
  const { id } = await params;

  // Check authorization (admin or self)
  const isAdmin = session.user.role === 'admin';
  const isSelf = session.user.id === id.toString();
  if (!isAdmin && !isSelf) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Check content type to determine how to parse the request
    const contentType = req.headers.get('content-type');
    let formData;
    
    if (contentType && contentType.includes('application/json')) {
      // Handle JSON request (faster for text-only updates)
      const jsonData = await req.json();
      formData = new Map();
      Object.entries(jsonData).forEach(([key, value]) => {
        formData.set(key, value);
      });
    } else {
      // Handle multipart form data (for file uploads)
      formData = await req.formData();
    }
    
    // Define which fields members can edit
    const memberEditableFields = [
      'name', 'mobile', 'officePhone', 'address', 'passportNumber', 'civilId',
      'alternateMobile', 'alternateEmail', 'companyName', 'profession', 'businessActivity',
      'sponsorName', 'nationality', 'industrySector', 'alternateIndustrySector',
      'companyAddress', 'companyWebsite', 'benefitFromIbpc', 'contributeToIbpc', 'proposer1',
      'proposer2', 'companyBrief', 'about', 'linkedin', 'instagram', 'twitter', 'facebook'
    ];
    
    // Admin-only fields (cannot be edited by members)
    const adminOnlyFields = ['memberId', 'uniqueId', 'membershipValidity', 'role', 'email', 'membershipType'];
    
    // Prepare update object
    const updateData = {};
    const socialLinks = {};

    // Process form fields
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('social.')) {
        // Handle social links
        const socialKey = key.split('.')[1];
        socialLinks[socialKey] = value;
      } else if (key === 'photo' || key === 'logo') {
        // Handle file uploads with local storage (only for multipart form data)
        if (value && typeof value === 'object' && 'size' in value && 'type' in value && value.size > 0) {
          try {
            // Get member ID and unique ID (serial number) from the user being updated
            const user = await User.findById(id).select('memberId uniqueId');
            const memberId = user?.memberId || id;
            const uniqueId = user?.uniqueId || `UNQ${Date.now()}`;
            
            const fileUrl = await uploadToLocal(value, key, memberId, uniqueId);
            updateData[key] = fileUrl;
          } catch (error) {
            console.error(`Error uploading ${key}:`, error);
            return NextResponse.json({ 
              error: `Failed to upload ${key}`, 
              details: error.message 
            }, { status: 500 });
          }
        }
      } else if (key === 'social') {
        // Handle social object from JSON request
        if (typeof value === 'object' && value !== null) {
          Object.assign(socialLinks, value);
        }
      } else {
        // Handle other fields - apply role-based restrictions
        if (isAdmin || memberEditableFields.includes(key)) {
          updateData[key] = value;
        }
      }
    }

    // Add social links to update if any
    if (Object.keys(socialLinks).length > 0) {
      updateData.social = socialLinks;
    }

    // Update user with timeout
    const updatePromise = User.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database operation timeout')), 10000)
    );
    
    const updatedUser = await Promise.race([updatePromise, timeoutPromise]);

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return updated user (excluding password)
    const { password, ...userResponse } = updatedUser.toObject();
    return NextResponse.json(userResponse);

  } catch (error) {
    console.error('PATCH Error:', error);
    return NextResponse.json({ 
      error: 'Server error', 
      details: error.message 
    }, { status: 500 });
  }
}

// Ensure file uploads are handled
export const config = {
  api: {
    bodyParser: false,
  },
};