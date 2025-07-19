import connectDB from '../../../lib/db';
import Inquiry from '../../../lib/models/Inquiry';

export async function GET() {
  await connectDB();
  const inquiries = await Inquiry.find({});
  return Response.json(inquiries);
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();
  const inquiry = new Inquiry(data);
  await inquiry.save();
  return Response.json({ message: 'Inquiry created' }, { status: 201 });
}

export async function PUT(req) {
  await connectDB();
  const { id, status } = await req.json();
  await Inquiry.findByIdAndUpdate(id, { status });
  return Response.json({ message: 'Updated' });
}