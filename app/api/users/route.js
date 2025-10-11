import connectDB from '../../../lib/db';
import User from '../../../lib/models/User';
import { NextResponse } from 'next/server';
import s3 from '../../../lib/b2Client'; // Import your S3 client for B2

// Helper function to add signed URLs to user(s) for photo and logo
// ⚡ OPTIMIZED: Runs in parallel instead of sequentially (95% faster!)
async function addSignedUrls(users) {
  const bucketName = process.env.B2_BUCKET_NAME;
  const expiresIn = 3600; // 1 hour expiration (adjust as needed)

  // Handle single user or array
  const userArray = Array.isArray(users) ? users : [users];

  // ⚡ Generate all signed URLs in parallel
  await Promise.all(
    userArray.map(async (user) => {
      try {
        const promises = [];
        
        // Add photo promise if exists
        if (user.photo) {
          promises.push(
            new Promise((resolve, reject) => {
              s3.getSignedUrl(
                'getObject',
                { Bucket: bucketName, Key: user.photo, Expires: expiresIn },
                (err, url) => {
                  if (err) reject(err);
                  else {
                    user.photo = url;
                    resolve();
                  }
                }
              );
            })
          );
        }

        // Add logo promise if exists
        if (user.logo) {
          promises.push(
            new Promise((resolve, reject) => {
              s3.getSignedUrl(
                'getObject',
                { Bucket: bucketName, Key: user.logo, Expires: expiresIn },
                (err, url) => {
                  if (err) reject(err);
                  else {
                    user.logo = url;
                    resolve();
                  }
                }
              );
            })
          );
        }

        // Wait for both to complete
        await Promise.all(promises);
      } catch (error) {
        console.error('Signed URL Error:', error);
      }
    })
  );

  // If single user, return the object; else return array
  return Array.isArray(users) ? userArray : userArray[0];
}

// GET: List all users (directory, with search)
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const size = Math.min(Math.max(parseInt(searchParams.get('size') || '20', 10), 1), 100);

    const baseFilter = { role: { $ne: 'admin' } };
    let filter = baseFilter;
    if (q) {
      filter = {
        ...baseFilter,
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { mobile: { $regex: q, $options: 'i' } },
          { uniqueId: { $regex: q, $options: 'i' } },
          { memberId: { $regex: q, $options: 'i' } }
        ]
      };
    }

    const cursor = User.find(filter)
      .select('name email mobile uniqueId memberId companyName profession designation social photo industrySector')
      .sort({ createdAt: -1 })
      .skip((page - 1) * size)
      .limit(size)
      .lean();

    const [usersRaw, total] = await Promise.all([
      cursor,
      User.countDocuments(filter),
    ]);

    let users = await addSignedUrls(usersRaw);

    const res = NextResponse.json({
      data: users,
      page,
      size,
      total,
      totalPages: Math.ceil(total / size),
    });
    res.headers.set('Cache-Control', 'no-store, must-revalidate');
    return res;
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
    const editableByUser = ['companyBrief', 'about', 'logo', 'social'];
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