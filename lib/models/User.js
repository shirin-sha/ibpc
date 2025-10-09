import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // Hash in production
  role: { type: String, enum: ['member', 'admin'], default: 'member' },
  uniqueId: { type: String, unique: true },
  memberId: { type: String, unique: true, sparse: true },
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
  about: String,
  logo: String,
  photo: { type: String, default: '' },
  social: { linkedin: String, instagram: String, twitter: String, facebook: String },
  // New fields
  nationality: String,
  membershipType: String,
  alternateMobile: String,
  alternateEmail: String,
  industrySector: String,
  alternateIndustrySector: String,
  companyAddress: String,
  companyWebsite: String,
  membershipValidity: String,
}, { timestamps: true });

// Helpful indexes for faster lookups and sorting/search
userSchema.index({ role: 1 });
userSchema.index({ mobile: 1 });
userSchema.index({ name: 1 });
userSchema.index({ uniqueId: 1 });
userSchema.index({ memberId: 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.models.User || mongoose.model('User', userSchema);