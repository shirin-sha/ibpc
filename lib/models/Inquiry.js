import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  name: String,
  email: String,
  business: String,
  status: { type: String, enum: ['Just Inquiry', 'Planning to Register', 'Registered'], default: 'Just Inquiry' },
}, { timestamps: true });

export default mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema);