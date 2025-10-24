import connectDB from '@/lib/db';
import User from '@/lib/models/User';

export async function GET() {
  try {
    await connectDB();
    
    // Get total count of users
    const totalUsers = await User.countDocuments();
    const memberUsers = await User.countDocuments({ role: 'member' });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    // Get recent users
    const recentUsers = await User.find()
      .select('name email memberId uniqueId role createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    return Response.json({
      success: true,
      counts: {
        total: totalUsers,
        members: memberUsers,
        admins: adminUsers
      },
      recentUsers: recentUsers
    });
  } catch (error) {
    console.error('Database test error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

