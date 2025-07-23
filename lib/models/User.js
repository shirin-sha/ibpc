import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // Hash in production
  role: { type: String, enum: ['member', 'admin'], default: 'member' },
  memberId: { type: String, unique: true },
  companyName: String,
  profession: String,
  designation: String,
  businessActivity: String,
  sponsorName: String,
  passportNumber: String,
  civilId: String,
  address: String,
  officePhone: String,
  residencePhone: String,
  mobile: String,
  benefitFromIbpc: String,
  contributeToIbpc: String,
  proposer1: String,
  proposer2: String,
  companyBrief: String,
  logo: String,
  photo: { type: String, default: '' },
  social: { linkedin: String, instagram: String, twitter: String, facebook: String },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);