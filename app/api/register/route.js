import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import Registration from '../../../lib/models/Registration';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import path from 'path';
import s3 from '@/lib/b2Client';

// Updated sendMail function (unchanged)
async function sendMail({ to, subject, text }) {
  console.log('Attempting to send email...');
  console.log('Using EMAIL_USER:', process.env.EMAIL_USER);
  console.log('Using EMAIL_PASS:', process.env.EMAIL_PASS ? '**** (loaded)' : 'NOT LOADED');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`Email sent successfully to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Email sending failed: ${error.message}`);
    if (error.response) console.error('Gmail response:', error.response);
    throw error;
  }
}

// Helper function to add signed URLs to registration(s) for photo
// (Adapted from addSignedUrls in app/api/users/route.js; handles registrations)
async function addSignedUrls(items) {
  const bucketName = process.env.B2_BUCKET_NAME;
  const expiresIn = 3600; // 1 hour expiration (adjust as needed)
  const fallbackImage = null; // Or set to '/default-avatar.png' for a local fallback

  // Handle single item or array
  const itemArray = Array.isArray(items) ? items : [items];

  for (let item of itemArray) {
    // Helper to generate signed URL with error handling
    const generateSignedUrl = (key) => {
      return new Promise((resolve, reject) => {
        s3.getSignedUrl(
          'getObject',
          { Bucket: bucketName, Key: key, Expires: expiresIn },
          (err, url) => {
            if (err) reject(err);
            else resolve(url);
          }
        );
      });
    };

    // Handle photo (assuming 'photo' is the only image field; add more if needed)
    if (item.photo) {
      try {
        item.photo = await generateSignedUrl(item.photo);
      } catch (error) {
        console.error(`Signed URL Error for photo (key: ${item.photo}):`, error);
        if (error.code === 'NoSuchKey') {
          item.photo = fallbackImage;
        } else {
          item.photo = fallbackImage;
        }
      }
    }
  }

  // If single item, return the object; else return array
  return Array.isArray(items) ? itemArray : itemArray[0];
}

// Updated uploadToB2 function: Returns KEY instead of full URL
async function uploadToB2(file) {
  const bucketName = process.env.B2_BUCKET_NAME;
  if (!bucketName) throw new Error('B2_BUCKET_NAME is not configured');

  const ext = path.extname(file.name).toLowerCase() || '.jpg';
  const filename = `photo-${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
  const key = `uploads/${filename}`; // Return this key
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await s3.putObject({
      Key: key,
      Body: buffer,
      Bucket: bucketName,
      ContentType: file.type // Add content type
    }).promise();

    return key; // Return KEY (e.g., 'uploads/photo-123.jpg')
  } catch (error) {
    console.error('B2 Upload Error:', error);
    throw new Error(`B2 Upload failed: ${error.message}`);
  }
}

// Update the POST handler: Store KEY in registration
export async function POST(request) {
  try {
    await connectDB();
    const formData = await request.formData();
    const photo = formData.get('photo');
    const data = { ...Object.fromEntries(formData.entries()) };
    
    let photoKey = ''; // Changed to photoKey for clarity
    if (photo && photo.size > 0) {
      photoKey = await uploadToB2(photo); // Get KEY from B2 upload
    }

    const registration = new Registration({ 
      ...data, 
      photo: photoKey, // Store KEY
      benefitFromIbpc: data.benefit,
      contributeToIbpc: data.contribution,
    });
    
    await registration.save();
    return NextResponse.json({ 
      message: 'Registration saved successfully',
      photoKey // Return key for reference (optional)
    }, { status: 201 });
    
  } catch (error) {
    return NextResponse.json({ 
      message: 'Server error', 
      error: error.message 
    }, { status: 500 });
  }
}

// GET: List all registrations (with signed URLs)
export async function GET() {
  try {
    await connectDB();
    let registrations = await Registration.find({}).sort({ createdAt: -1 });
    
    // Add signed URLs
    registrations = await addSignedUrls(registrations);
    
    return NextResponse.json(registrations);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT: Approve registration and create user (store KEY in user)
export async function PUT(req) {
  try {
    await connectDB();
    const { id } = await req.json();
    console.log('Approving registration ID:', id);

    const reg = await Registration.findById(id);
    if (!reg) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (reg.status === 'Approved') {
      return NextResponse.json({ error: 'Already approved' }, { status: 400 });
    }

    const memberId = 'IBPC' + Date.now().toString().slice(-6);
    const username = reg.email;
    const rawPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = new User({
      name: reg.fullName || reg.name,
      email: reg.email,
      password: hashedPassword,
      role: 'member',
      memberId,
      companyName: reg.companyName,
      profession: reg.profession,
      designation: reg.designation,
      businessActivity: reg.businessActivity,
      sponsorName: reg.sponsorName,
      passportNumber: reg.passportNumber,
      civilId: reg.civilId,
      address: reg.address,
      officePhone: reg.officePhone,
      residencePhone: reg.residencePhone,
      mobile: reg.mobile,
      benefitFromIbpc: reg.benefitFromIbpc,
      contributeToIbpc: reg.contributeToIbpc,
      proposer1: reg.proposer1,
      proposer2: reg.proposer2,
      photo: reg.photo || '', // Store KEY (or empty if none)
    });
    await user.save();
    console.log('User created successfully');

    reg.status = 'Approved';
    await reg.save();
    console.log('Registration status updated');

    await sendMail({
      to: reg.email,
      subject: 'Your IBPC Membership Credentials',
      text: `Dear ${reg.fullName || reg.name},\n\nYour IBPC membership has been approved.\n\nMember ID: ${memberId}\nUsername: ${username}\nPassword: ${rawPassword}\n\nLogin URL: https://ibpc-nextjs.vercel.app \n\nPlease log in and change your password after first login.\n\nRegards,\nIBPC Kuwait`
    });

    return NextResponse.json({ message: 'Member created and credentials sent.' });
  } catch (error) {
    console.error('Approval error:', error.message);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

// Required for FormData handling
export const config = {
  api: {
    bodyParser: false,
  },
};