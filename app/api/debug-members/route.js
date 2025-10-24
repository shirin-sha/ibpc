import connectDB from '@/lib/db';
import User from '@/lib/models/User';

export async function GET() {
  try {
    await connectDB();
    
    // Get all members with detailed info
    const allMembers = await User.find({ role: 'member' })
      .select('name email mobile uniqueId memberId companyName profession designation createdAt')
      .sort({ createdAt: -1 })
      .lean();
    
    // Get recent uploads (last 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentUploads = await User.find({ 
      role: 'member',
      createdAt: { $gte: tenMinutesAgo }
    })
      .select('name email mobile uniqueId memberId companyName profession createdAt')
      .sort({ createdAt: -1 })
      .lean();
    
    return Response.json({
      success: true,
      totalMembers: allMembers.length,
      allMembers: allMembers,
      recentUploads: recentUploads,
      recentUploadCount: recentUploads.length
    });
  } catch (error) {
    console.error('Debug error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

