import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyName: { type: String, required: true },
  profession: { type: String, required: true },
  businessActivity: String,
  sponsorName: String,
  passportNumber: String,
  civilId: String,
  address: String,
  officePhone: String,
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  alternateMobile: String, // Optional
  alternateEmail: String, // Optional
  industrySector: { type: String, default: '' },
  alternateIndustrySector: String, // Optional
  companyAddress: { type: String, },
  companyWebsite: { type: String, },
  benefitFromIbpc: String,
  contributeToIbpc: String,
  proposer1: String,
  proposer2: String,
  photo: { type: String, default: '' }, // New field for photo URL
  status: { type: String, default: 'Pending' },
  consent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  membershipValidity: String, // Optional, set by admin
  uniqueId: String, // Assigned upon approval
  memberId: String, // Assigned upon approval (based on membershipType)
  // New fields
  nationality: { type: String, required: true },
  membershipType: { type: String, required: true },
});

export default mongoose.models.Registration || mongoose.model('Registration', registrationSchema);