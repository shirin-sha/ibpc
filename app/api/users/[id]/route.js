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
async function uploadToLocal(file, prefix = 'photo') {
  const folder = prefix === 'logo' ? 'companylogos' : 'profileimages';
  
  try {
    const fileUrl = await uploadFile(file, folder);
    return fileUrl; // Return the public URL path
  } catch (error) {
    console.error('Local Upload Error:', error);
    throw new Error(`Local Upload failed: ${error.message}`);
  }
}

// In your PATCH handler, when setting updateData[key] = await uploadToB2(value, key);
// This will now store the key (e.g., 'uploads/photo-123.jpg') in user.photo or user.logo

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
    // Parse multipart form data
    const formData = await req.formData();
    
    // Define which fields members can edit
    const memberEditableFields = ['companyBrief', 'about', 'linkedin', 'instagram', 'twitter', 'facebook'];
    
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
        // Handle file uploads with local storage
        if (value && typeof value === 'object' && 'size' in value && 'type' in value && value.size > 0) {
          try {
            const fileUrl = await uploadToLocal(value, key);
            updateData[key] = fileUrl;
          } catch (error) {
            console.error(`Error uploading ${key}:`, error);
            return NextResponse.json({ 
              error: `Failed to upload ${key}`, 
              details: error.message 
            }, { status: 500 });
          }
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

    // Debug logging
    console.log('Update data being sent to database:', updateData);
    console.log('About field value:', updateData.about);

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

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