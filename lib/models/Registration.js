import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
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
  email: { type: String, required: true },
  benefitFromIbpc: String,
  contributeToIbpc: String,
  proposer1: String,
  proposer2: String,
  photo: { type: String, default: '' }, // New field for photo URL
  status: { type: String, default: 'Pending' },
  consent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Registration || mongoose.model('Registration', registrationSchema);