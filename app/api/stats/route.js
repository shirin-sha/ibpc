import connectDB from '../../../lib/db';
import User from '../../../lib/models/User';
import Registration from '../../../lib/models/Registration';
import { NextResponse } from 'next/server';

// GET: Admin dashboard statistics
export async function GET(req) {
  try {
    await connectDB();
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // ⚡ Run all queries in parallel for speed
    const [
      totalMembers,
      newMembersCount,
      pendingRegistrations,
      corporateMembers,
      individualMembers
    ] = await Promise.all([
      User.countDocuments({ role: 'member' }),
      User.countDocuments({ 
        role: 'member', 
        createdAt: { $gte: sevenDaysAgo } 
      }),
      Registration.countDocuments({ status: 'Pending' }),
      User.countDocuments({ 
        role: 'member', 
        membershipType: 'Corporate Member' 
      }),
      User.countDocuments({ 
        role: 'member', 
        membershipType: 'Individual Member' 
      })
    ]);
    
    return NextResponse.json({
      totalMembers,
      newMembers: newMembersCount,
      pendingRegistrations,
      corporateMembers,
      individualMembers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Stats Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}






