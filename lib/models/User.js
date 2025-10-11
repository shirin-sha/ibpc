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

// ⚡ OPTIMIZED INDEXES for faster lookups and full-text search
// Single field indexes (uniqueId, memberId, email already indexed via unique: true)
userSchema.index({ role: 1 });
userSchema.index({ mobile: 1 });
userSchema.index({ name: 1 });
userSchema.index({ createdAt: -1 });

// ⚡ TEXT INDEX for fast full-text search (10-20x faster than regex!)
userSchema.index({
  name: 'text',
  mobile: 'text',
  email: 'text',
  uniqueId: 'text',
  memberId: 'text',
  companyName: 'text'
}, {
  weights: {
    name: 10,        // Name is most important
    memberId: 8,     // Member ID next
    uniqueId: 7,
    email: 5,
    mobile: 5,
    companyName: 3
  },
  name: 'user_search_index'
});

// ⚡ COMPOUND INDEXES for common query patterns
userSchema.index({ role: 1, createdAt: -1 }); // List members sorted by date
userSchema.index({ role: 1, name: 1 });       // List members sorted by name
userSchema.index({ membershipType: 1, createdAt: -1 }); // Filter by membership

export default mongoose.models.User || mongoose.model('User', userSchema);