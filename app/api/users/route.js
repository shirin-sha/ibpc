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
      // Prefer text index search when available; fallback to regex if needed
      filter = { ...baseFilter, $text: { $search: q } };
    }

    const findQuery = User.find(filter)
      .select('name email mobile uniqueId memberId companyName profession designation social photo industrySector')
      .sort(q ? { score: { $meta: 'textScore' }, createdAt: -1, _id: -1 } : { createdAt: -1, _id: -1 })
      .skip((page - 1) * size)
      .limit(size)
      .lean();

    const [usersRaw, total] = await Promise.all([
      findQuery,
      User.countDocuments(filter),
    ]);

    let users = await addLocalUrls(usersRaw);

    const res = NextResponse.json({
      data: users,
      page,
      size,
      total,
      totalPages: Math.ceil(total / size),
    });
    // Allow brief caching to improve UX when navigating pages
    res.headers.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
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

    // Define editable fields for members
    const editableByUser = [
      'name', 'mobile', 'officePhone', 'address', 'passportNumber', 'civilId',
      'alternateMobile', 'alternateEmail', 'companyName', 'profession', 'businessActivity',
      'sponsorName', 'nationality', 'industrySector', 'alternateIndustrySector',
      'companyAddress', 'companyWebsite', 'benefitFromIbpc', 'contributeToIbpc', 'proposer1',
      'proposer2', 'companyBrief', 'about', 'logo', 'photo', 'social'
    ];
    
    // Admin-only fields (cannot be edited by members)
    const adminOnlyFields = ['memberId', 'uniqueId', 'membershipValidity', 'role'];
    
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