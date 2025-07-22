import connectDB from '../../../lib/db';
import User from '../../../lib/models/User';
import { NextResponse } from 'next/server';
import s3 from '../../../lib/b2Client'; // Import your S3 client for B2

// Helper function to add signed URLs to user(s) for photo and logo
async function addSignedUrls(users) {
  const bucketName = process.env.B2_BUCKET_NAME;
  const expiresIn = 3600; // 1 hour expiration (adjust as needed)

  // Handle single user or array
  const userArray = Array.isArray(users) ? users : [users];

  for (let user of userArray) {
    try {
      if (user.photo) {
        user.photo = await new Promise((resolve, reject) => {
          s3.getSignedUrl(
            'getObject',
            { Bucket: bucketName, Key: user.photo, Expires: expiresIn },
            (err, url) => {
              if (err) reject(err);
              else resolve(url);
            }
          );
        });
      }

      if (user.logo) {
        user.logo = await new Promise((resolve, reject) => {
          s3.getSignedUrl(
            'getObject',
            { Bucket: bucketName, Key: user.logo, Expires: expiresIn },
            (err, url) => {
              if (err) reject(err);
              else resolve(url);
            }
          );
        });
      }
    } catch (error) {
      console.error('Signed URL Error:', error);
      // Fallback: Return original key or handle error (e.g., set to null)
      // user.photo = null; // Optional: Clear if signing fails
    }
  }

  // If single user, return the object; else return array
  return Array.isArray(users) ? userArray : userArray[0];
}

// GET: List all users (directory, with search)
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    let filter = {};
    if (q) {
      filter = {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { mobile: { $regex: q, $options: 'i' } }, // Assuming 'mobile' is the field (was 'phone' in previous code)
          { memberId: { $regex: q, $options: 'i' } } // Assuming 'memberId' is like '_id' or custom
        ]
      };
    }
    let users = await User.find(filter).select('-password');
    
    // Add signed URLs
    users = await addSignedUrls(users);
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST: Get single user by ID (for profile view/edit)
export async function POST(req) {
  try {
    await connectDB();
    const { id } = await req.json();
    let user = await User.findById(id).select('-password');
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    // Add signed URLs
    user = await addSignedUrls(user);
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH: Update user (role-based field control)
export async function PATCH(req) {
  try {
    await connectDB();
    const { id, updates, role } = await req.json();

    // Define editable fields
    const editableByUser = ['companyBrief', 'logo', 'social'];
    let allowedFields = role === 'admin'
      ? Object.keys(User.schema.paths).filter(f => f !== 'password' && f !== '_id' && f !== '__v')
      : editableByUser;

    // Build update object
    let updateObj = {};
    for (let key of allowedFields) {
      if (updates[key] !== undefined) updateObj[key] = updates[key];
    }

    let updated = await User.findByIdAndUpdate(id, updateObj, { new: true }).select('-password');
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    // Add signed URLs to the response
    updated = await addSignedUrls(updated);
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}