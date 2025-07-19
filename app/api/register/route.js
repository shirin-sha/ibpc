import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import Registration from '../../../lib/models/Registration';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import fs from 'fs/promises';
import path from 'path';

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

// Helper function to save photo locally
async function savePhotoLocally(file) {
  try {
    // Generate unique filename
    const ext = path.extname(file.name) || '.jpg';
    const filename = `photo-${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

    // Convert file to buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Return the public URL path
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Photo save error:', error);
    throw error;
  }
}

// POST: Create registration with photo upload
export async function POST(request) {
  try {
    await connectDB();

    // Parse FormData (handles both file and text fields)
    const formData = await request.formData();
    const photo = formData.get('photo');
    
    // Extract all form fields except photo
    const data = {};
    for (const [key, value] of formData.entries()) {
      if (key !== 'photo') {
        data[key] = value;
      }
    }

    // Handle photo upload if provided
    let photoUrl = '';
    if (photo && photo.size > 0) {
      photoUrl = await savePhotoLocally(photo);
      console.log('Photo saved:', photoUrl);
    }

    // Create registration with photo URL
    const registration = new Registration({ 
      ...data, 
      photo: photoUrl,
      benefitFromIbpc: data.benefit, // Map form field names
      contributeToIbpc: data.contribution,
    });
    
    await registration.save();
    console.log('Registration saved successfully');
    
    return NextResponse.json({ 
      message: 'Registration saved successfully',
      photoUrl: photoUrl 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      message: 'Server error', 
      error: error.message 
    }, { status: 500 });
  }
}

// GET: List all registrations (unchanged)
export async function GET() {
  await connectDB();
  const registrations = await Registration.find({}).sort({ createdAt: -1 });
  return NextResponse.json(registrations);
}

// PUT: Approve registration and create user (updated to include photo)
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
      fax: reg.fax,
      benefitFromIbpc: reg.benefitFromIbpc,
      contributeToIbpc: reg.contributeToIbpc,
      proposers: reg.proposers ? reg.proposers.join(', ') : 'N/A',
      photo: reg.photo, // Include photo in user record
    });
    await user.save();
    console.log('User created successfully');

    reg.status = 'Approved';
    await reg.save();
    console.log('Registration status updated');

    await sendMail({
      to: reg.email,
      subject: 'Your IBPC Membership Credentials',
      text: `Dear ${reg.fullName || reg.name},\n\nYour IBPC membership has been approved.\n\nMember ID: ${memberId}\nUsername: ${username}\nPassword: ${rawPassword}\n\nPlease log in and change your password after first login.\n\nRegards,\nIBPC Kuwait`
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