// app/api/users/[id]/route.js
import connectDB from '../../../../lib/db';
import User from '../../../../lib/models/User';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import fs from 'fs/promises';
import path from 'path';
// app/api/users/[id]/route.js
import { writeFile } from 'fs/promises';

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const isAdmin = session.user.role === 'admin';
  const isSelf = session.user.id === params.id.toString();
  if (!isAdmin && !isSelf) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectDB();
    const user = await User.findById(params.id).select('-password');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    console.error('GET Error:', error);  // Log server-side errors
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

  // Check authorization (admin or self)
  const isAdmin = session.user.role === 'admin';
  const isSelf = session.user.id === params.id.toString();
  if (!isAdmin && !isSelf) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Parse multipart form data
    const formData = await req.formData();
    
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
        // Handle file uploads
        if (value && value instanceof File) {
          const bytes = await value.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          // Generate unique filename
          const filename = `${key}_${Date.now()}_${value.name}`;
          const uploadPath = path.join(process.cwd(), 'public', 'uploads', filename);
          
          // Write file
          await writeFile(uploadPath, buffer);
          
          // Store file path in update data
          updateData[key] = `/uploads/${filename}`;
        }
      } else {
        // Handle other fields
        updateData[key] = value;
      }
    }

    // Add social links to update if any
    if (Object.keys(socialLinks).length > 0) {
      updateData.social = socialLinks;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      params.id, 
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