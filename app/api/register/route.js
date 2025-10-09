import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import Registration from '../../../lib/models/Registration';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import path from 'path';
import s3 from '@/lib/b2Client';

// Updated sendMail function (unchanged)
async function sendMail({ to, subject, text, html }) {
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
      html,
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

// Simple backend validation for required fields (must match UI)
function validateRegistrationPayload(data) {
  const requiredFields = [
    'name',
    'profession',
    'companyName',
    'nationality',
    'membershipType',
    'mobile',
    'email',
  ];
  const missing = requiredFields.filter((f) => !data[f] || String(data[f]).trim() === '');
  if (missing.length) {
    return `Missing required fields: ${missing.join(', ')}`;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(data.email))) {
    return 'Invalid email format';
  }
  return null;
}

// Update the POST handler: Store KEY in registration
export async function POST(request) {
  try {
    await connectDB();
    const formData = await request.formData();
    const photo = formData.get('photo');
    const data = { ...Object.fromEntries(formData.entries()) };

    // Validate per mandatory fields
    const validationError = validateRegistrationPayload(data);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    // Normalize email for deduplication
    const normalizedEmail = String(data.email || '').trim().toLowerCase();
    data.email = normalizedEmail;

    // Duplicate email checks across Registration and User
    const [existingReg, existingUser] = await Promise.all([
      Registration.findOne({ email: normalizedEmail, status: { $ne: 'Rejected' } }),
      User.findOne({ email: normalizedEmail }),
    ]);
    if (existingReg || existingUser) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
    }

    let photoKey = ''; // Changed to photoKey for clarity
    if (photo && photo.size > 0) {
      photoKey = await uploadToB2(photo); // Get KEY from B2 upload
    }

    const registration = new Registration({ 
      ...data, 
      photo: photoKey, // Store KEY
      benefitFromIbpc: data.benefit,
      contributeToIbpc: data.contribution,
      alternateMobile: data.alternateMobile,
      alternateEmail: data.alternateEmail,
      industrySector: data.industrySector,
      alternateIndustrySector: data.alternateIndustrySector,
      companyAddress: data.companyAddress,
      companyWebsite: data.companyWebsite,
    });
    
    await registration.save();

    // Send Thank-You email (non-blocking; logs error but does not fail request)
    try {
      await sendMail({
        to: registration.email,
        subject: 'Thank You for Registering with IBPC Kuwait Membership System',
        text: `Dear ${registration.name},\n\nThank you for registering with the Indian Business & Professional Council (IBPC) Kuwait – Membership Management System (MMS).\n\nWe have successfully received your application. Our team will carefully review the information you have provided. If your application is approved, you will receive a follow-up email with:\n\n• Your IBPC Unique ID\n• Your login credentials for the MMS portal\n• Guidelines on how to access member-exclusive features and benefits\n\nIn the meantime, please ensure that all the details provided are correct. If any additional information is required, our team will contact you directly.\n\n📩 For support or queries:\n• Email: admin@ibpckuwait.org\n• Phone/WhatsApp: +965 9958 6968\n\n🀀 You can also visit our website at www.ibpckuwait.org to learn more about IBPC’s activities, upcoming events, and member benefits.\n\nWe appreciate your interest in becoming a part of our thriving community of professionals, entrepreneurs, and business leaders. We look forward to welcoming you as a valued member of IBPC Kuwait.\n\nWarm regards,\nMembership Team\nIndian Business & Professional Council (IBPC) Kuwait`,
        html: `<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Thank You for Registering with IBPC Kuwait MMS</title>
    <style>
      body { background-color: #f5f7fb; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #111827; }
      .container { max-width: 640px; margin: 0 auto; padding: 24px; }
      .card { background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }
      .header { background: linear-gradient(90deg, #ef4444 0%, #1f2937 100%); color: #fff; padding: 20px 24px; }
      .header h1 { margin: 0; font-size: 18px; }
      .content { padding: 24px; line-height: 1.6; color: #374151; }
      .section-title { font-size: 14px; font-weight: 700; color: #111827; margin: 16px 0 8px; }
      .list { padding-left: 16px; margin: 8px 0 16px; }
      .list li { margin: 4px 0; }
      .muted { color: #6b7280; font-size: 12px; }
      .footer { text-align: center; color: #6b7280; font-size: 12px; padding: 16px 0 0; }
      .brand { font-weight: 700; }
      .kbd { display: inline-block; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; padding: 2px 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; }
      a { color: #2563eb; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="header">
          <h1>Thank You for Registering with IBPC Kuwait MMS</h1>
        </div>
        <div class="content">
          <p>Dear ${registration.name},</p>
          <p>
            Thank you for registering with the <b>Indian Business & Professional Council (IBPC) Kuwait</b> –
            <b>Membership Management System (MMS)</b>.
          </p>
          <p>
            We have successfully received your application. Our team will carefully review the information you have provided.
            If your application is approved, you will receive a follow-up email with:
          </p>
          <ul class="list">
            <li>Your <b>IBPC Member ID</b> and <b>Unique ID</b></li>
            <li>Your <b>login credentials</b> for the MMS portal</li>
            <li>Guidelines on how to access <b>member-exclusive features and benefits</b></li>
          </ul>
          <p>
            In the meantime, please ensure that all the details provided are correct. If any additional information is required,
            our team will contact you directly.
          </p>
          <div class="section-title">For support or queries:</div>
          <ul class="list">
            <li><b>Email:</b> <a href="mailto:admin@ibpckuwait.org">admin@ibpckuwait.org</a></li>
            <li><b>Phone/WhatsApp:</b> +965 9958 6968</li>
          </ul>
          <p class="muted">
            You can also visit our website at <a href="https://www.ibpckuwait.org" target="_blank" rel="noopener">www.ibpckuwait.org</a>
            to learn more about IBPC’s activities, upcoming events, and member benefits.
          </p>
          <p>
            We appreciate your interest in becoming a part of our thriving community of professionals, entrepreneurs, and business leaders.
            We look forward to welcoming you as a valued member of IBPC Kuwait.
          </p>
          <p>
            Warm regards,<br/>
            <span class="brand">Membership Team</span><br/>
            Indian Business & Professional Council (IBPC) Kuwait
          </p>
        </div>
      </div>
        <div class="footer">This is an automated message. Please do not reply.</div>
    </div>
  </body>
</html>`
      });
    } catch (emailError) {
      console.error('Thank-you email failed:', emailError);
    }

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
    let registrations = await Registration.find({}).sort({ createdAt: -1 }).lean();
    // Add signed URLs
    registrations = await addSignedUrls(registrations);
    const res = NextResponse.json(registrations);
    res.headers.set('Cache-Control', 'no-store, must-revalidate');
    return res;
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT: Approve registration and create user (store KEY in user)
export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, membershipValidity } = body;
    const reg = await Registration.findById(id);
    if (!reg) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // If only updating membershipValidity (admin action)
    if (membershipValidity) {
      reg.membershipValidity = membershipValidity;
      await reg.save();
      return NextResponse.json({ message: 'Membership validity updated.' });
    }

    if (reg.status === 'Approved') {
      return NextResponse.json({ error: 'Already approved' }, { status: 400 });
    }

    // Generate next 5-digit uniqueId (numbers only, start at 10001)
    const lastUser = await User.findOne({ uniqueId: { $regex: /^\d{5}$/ } }).sort({ uniqueId: -1 });
    let nextUniqueId = 10001;
    if (lastUser && lastUser.uniqueId && !isNaN(Number(lastUser.uniqueId))) {
      nextUniqueId = Math.max(Number(lastUser.uniqueId) + 1, 10001);
    }
    const uniqueId = String(nextUniqueId).padStart(5, '0');

    // Generate memberId based on membershipType
    let memberId;
    const membershipType = reg.membershipType || '';
    
    if (membershipType === 'Corporate Member') {
      // Corporate: C10000, C10001, etc.
      const lastCorporate = await User.findOne({ memberId: { $regex: /^C\d+$/ } }).sort({ memberId: -1 });
      let nextNum = 10000;
      if (lastCorporate && lastCorporate.memberId) {
        const lastNum = parseInt(lastCorporate.memberId.substring(1));
        nextNum = Math.max(lastNum + 1, 10000);
      }
      memberId = `C${nextNum}`;
    } else if (membershipType === 'Individual Member') {
      // Individual: I10000, I10001, etc.
      const lastIndividual = await User.findOne({ memberId: { $regex: /^I\d+$/ } }).sort({ memberId: -1 });
      let nextNum = 10000;
      if (lastIndividual && lastIndividual.memberId) {
        const lastNum = parseInt(lastIndividual.memberId.substring(1));
        nextNum = Math.max(lastNum + 1, 10000);
      }
      memberId = `I${nextNum}`;
    } else if (membershipType === 'Special Honorary Member') {
      // Special Honorary: S10000, S10001, etc.
      const lastSpecialHonorary = await User.findOne({ memberId: { $regex: /^S\d+$/ } }).sort({ memberId: -1 });
      let nextNum = 10000;
      if (lastSpecialHonorary && lastSpecialHonorary.memberId) {
        const lastNum = parseInt(lastSpecialHonorary.memberId.substring(1));
        nextNum = Math.max(lastNum + 1, 10000);
      }
      memberId = `S${nextNum}`;
    } else {
      // Honorary Member: H10000, H10001, etc.
      const lastHonorary = await User.findOne({ memberId: { $regex: /^H\d+$/ } }).sort({ memberId: -1 });
      let nextNum = 10000;
      if (lastHonorary && lastHonorary.memberId) {
        const lastNum = parseInt(lastHonorary.memberId.substring(1));
        nextNum = Math.max(lastNum + 1, 10000);
      }
      memberId = `H${nextNum}`;
    }

    const username = reg.email;
    const rawPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = new User({
      name: reg.name,
      email: reg.email,
      password: hashedPassword,
      role: 'member',
      uniqueId,
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

      mobile: reg.mobile,
      benefitFromIbpc: reg.benefitFromIbpc,
      contributeToIbpc: reg.contributeToIbpc,
      proposer1: reg.proposer1,
      proposer2: reg.proposer2,
      photo: reg.photo || '',
      // New fields propagated from registration
      nationality: reg.nationality,
      membershipType: reg.membershipType,
      alternateMobile: reg.alternateMobile,
      alternateEmail: reg.alternateEmail,
      industrySector: reg.industrySector,
      alternateIndustrySector: reg.alternateIndustrySector,
      companyAddress: reg.companyAddress,
      companyWebsite: reg.companyWebsite,
    });
    await user.save();
    reg.status = 'Approved';
    reg.uniqueId = uniqueId;
    reg.memberId = memberId;
    await reg.save();

    await sendMail({
      to: reg.email,
      subject: 'Your New IBPC Kuwait MMS Login Credentials',
      text: `Dear ${reg.name},\n\nWe are excited to inform you that the Indian Business & Professional Council (IBPC) Kuwait has launched its new Membership Management System (MMS) to better serve our valued members.\n\nAs you are already a registered member of IBPC, we have created your account on this new system. Please find your login details below:\n\n• Member ID: ${memberId}\n• Unique ID: ${uniqueId}\n• Username: ${username}\n• Password: ${rawPassword}\n• Login Portal: https://ibpckuwait.vercel.app\n\n👉 For security reasons, we strongly recommend that you log in at your earliest convenience and reset your password.\n\nWith the new MMS, you can now:\n• Access the Members Directory and view fellow professionals\n• Manage your membership profile easily online\n• Explore exclusive opportunities offered to IBPC members\n\n📩 Need Help?\n• Email: admin@ibpckuwait.org\n• Phone/WhatsApp: +965 9958 6968\n\n🀀 Visit our website: www.ibpckuwait.org for more information and upcoming updates.\n\nWe thank you for being a valued member of IBPC Kuwait and look forward to your active participation on our new platform.\n\nWarm regards,\nMembership Team\nIndian Business & Professional Council (IBPC) Kuwait`,
      html: `<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Your New IBPC Kuwait MMS Login Credentials</title>
    <style>
      body { background-color: #f5f7fb; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #111827; }
      .container { max-width: 640px; margin: 0 auto; padding: 24px; }
      .card { background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }
      .header { background: linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%); color: #fff; padding: 20px 24px; }
      .header h1 { margin: 0; font-size: 18px; }
      .content { padding: 24px; line-height: 1.6; color: #374151; }
      .section-title { font-size: 14px; font-weight: 700; color: #111827; margin: 16px 0 8px; }
      .list { padding-left: 16px; margin: 8px 0 16px; }
      .list li { margin: 4px 0; }
      .kbd { display: inline-block; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; padding: 2px 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; }
      .cta { display: inline-block; background: #16a34a; color: white; text-decoration: none; padding: 10px 14px; border-radius: 8px; font-weight: 600; }
      .muted { color: #6b7280; font-size: 12px; }
      .footer { text-align: center; color: #6b7280; font-size: 12px; padding: 16px 0 0; }
      .brand { font-weight: 700; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="header">
          <h1>Your New IBPC Kuwait MMS Login Credentials</h1>
        </div>
        <div class="content">
          <p>Dear ${reg.name},</p>
          <p>
            We are excited to inform you that the <b> Indian Business & Professional Council (IBPC) Kuwait</b>
            has launched its new <b> Membership Management System (MMS)</b> to better serve our valued members.
          </p>
          <p>
            As you are already a registered member of IBPC, we have created your account on this new system.
            Please find your login details below:
          </p>
          <ul class="list">
            <li><strong>Member ID:</strong> <span class="kbd">${memberId}</span></li>
            <li><strong>Unique ID:</strong> <span class="kbd">${uniqueId}</span></li>
            <li><strong>Username:</strong> <span class="kbd">${username}</span></li>
            <li><strong>Password:</strong> <span class="kbd">${rawPassword}</span></li>
            <li><strong>Login Portal:</strong> <a href="https://ibpckuwait.vercel.app" target="_blank" rel="noopener">https://ibpckuwait.vercel.app</a></li>
          </ul>
          <p>
            👉 For security reasons, we strongly recommend that you log in at your earliest convenience
            and <b>reset your password.</b>
          </p>
          <div style="margin: 16px 0;">
            <a href="https://ibpckuwait.vercel.app" target="_blank" rel="noopener" class="cta">Go to Login Portal</a>
          </div>
          <div class="section-title">With the new MMS, you can now:</div>
          <ul class="list">
            <li>Access the <b>Members Directory</b> and view fellow professionals</li>
            <li>Manage your <b>membership profile</b> easily online</li>
            <li>Explore <b>exclusive opportunities</b> offered to IBPC members</li>
          </ul>
          <div class="section-title">Need Help?</div>
          <ul class="list">
            <li><strong>Email:</strong> <a href="mailto:admin@ibpckuwait.org">admin@ibpckuwait.org</a></li>
            <li><strong>Phone/WhatsApp:</strong> +965 9958 6968</li>
          </ul>
          <p class="muted">Visit our website: <a href="https://www.ibpckuwait.org" target="_blank" rel="noopener">www.ibpckuwait.org</a> for more information and upcoming updates.</p>
          <p>
            We thank you for being a valued member of IBPC Kuwait and look forward to your active participation on our new platform.
          </p>
          <p>
            Warm regards,<br/>
            <span class="brand">Membership Team</span><br/>
            Indian Business & Professional Council (IBPC) Kuwait
          </p>
        </div>
      </div>
        <div class="footer">This is an automated message. Please do not reply.</div>
    </div>
  </body>
</html>`
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