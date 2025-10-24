import connectDB from '../../../lib/db';
import User from '../../../lib/models/User';
import { NextResponse } from 'next/server';
const { getFileUrl } = require('../../../lib/localStorage');

// Helper function to add local URLs to user(s) for photo and logo
async function addLocalUrls(users) {
  // Handle single user or array
  const userArray = Array.isArray(users) ? users : [users];

  // Process all users
  userArray.forEach((user) => {
    // Add photo URL if exists
    if (user.photo) {
      user.photo = getFileUrl(user.photo);
    }

    // Add logo URL if exists
    if (user.logo) {
      user.logo = getFileUrl(user.logo);
    }
  });

  // If single user, return the object; else return array
  return Array.isArray(users) ? userArray : userArray[0];
}

// GET: List all users (directory, with search) - Updated to match registration pagination format
export async function GET(req) {
  try {
    await connectDB();
    
    // Parse query parameters for pagination and filtering
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    
    // Build query
    let query = { role: { $ne: 'admin' } };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { profession: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get total count for pagination
    const totalCount = await User.countDocuments(query);
    
    // Get paginated users with optimized fields
    let users = await User.find(query)
      .select('name email mobile uniqueId memberId companyName profession designation social photo industrySector')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    
    // Add local URLs only for visible images
    users = await addLocalUrls(users);
    
    const response = NextResponse.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });
    
    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return response;
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
    // Add local URLs
    user = await addLocalUrls(user);
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

    // Add local URLs to the response
    updated = await addLocalUrls(updated);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}