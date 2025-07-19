import connectDB from '../../../lib/db';
import User from '../../../lib/models/User';
import { NextResponse } from 'next/server';

// GET: List all users (directory, with search)
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  let filter = {};
  if (q) {
    filter = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { mobile: { $regex: q, $options: 'i' } },
        { memberId: { $regex: q, $options: 'i' } }
      ]
    };
  }
  const users = await User.find(filter).select('-password');
  return NextResponse.json(users);
}

// GET: Get single user by ID (for profile view/edit)
export async function POST(req) {
  await connectDB();
  const { id } = await req.json();
  const user = await User.findById(id).select('-password');
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(user);
}

// PATCH: Update user (role-based field control)
export async function PATCH(req) {
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

  const updated = await User.findByIdAndUpdate(id, updateObj, { new: true }).select('-password');
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}