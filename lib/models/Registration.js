import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyName: String,
  profession: String,
  designation: String,
  businessActivity: String,
  sponsorName: String,
  passportNumber: String,
  civilId: String,
  address: String,
  officePhone: String,
  mobile: String,
  email: { type: String, required: true },
  alternateMobile: String, // Optional
  alternateEmail: String, // Optional
  industrySector: { type: String, required: true },
  alternateIndustrySector: String, // Optional
  companyAddress: { type: String, required: true },
  companyWebsite: { type: String, required: true },
  benefitFromIbpc: String,
  contributeToIbpc: String,
  proposer1: String,
  proposer2: String,
  photo: { type: String, default: '' }, // New field for photo URL
  status: { type: String, default: 'Pending' },
  consent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  membershipValidity: String, // Optional, set by admin
  // New fields
  nationality: { type: String, required: true },
  membershipType: { type: String, required: true },
});

export default mongoose.models.Registration || mongoose.model('Registration', registrationSchema);