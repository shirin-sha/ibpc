import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

// Dynamic import for XLSX to avoid potential issues
let XLSX;
async function getXLSX() {
  if (!XLSX) {
    XLSX = await import('xlsx');
  }
  return XLSX;
}

// Email sending function
async function sendMail({ to, subject, text, html }) {
  console.log('📧 Attempting to send email...');
  console.log('📧 From:', process.env.EMAIL_USER);
  console.log('📧 To:', to);
  console.log('📧 Subject:', subject);

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
    console.log(`✅ Email sent successfully to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Email sending failed to ${to}:`, error.message);
    if (error.response) {
      console.error('❌ Gmail response:', error.response);
    }
    throw error;
  }
}

// Generate next serial number
async function generateSerialNumber() {
  const lastUser = await User.findOne({ uniqueId: { $regex: /^\d{5}$/ } }).sort({ uniqueId: -1 });
  let nextUniqueId = 10001;
  if (lastUser && lastUser.uniqueId && !isNaN(Number(lastUser.uniqueId))) {
    nextUniqueId = Math.max(Number(lastUser.uniqueId) + 1, 10001);
  }
  return String(nextUniqueId).padStart(5, '0');
}

// Generate member ID based on membership type
async function generateMemberId(membershipType) {
  let memberId;
  
  if (membershipType === 'Corporate Member' || membershipType === 'CORPORATE') {
    const lastCorporate = await User.findOne({ memberId: { $regex: /^C\d+$/ } }).sort({ memberId: -1 });
    let nextNum = 10000;
    if (lastCorporate && lastCorporate.memberId) {
      const lastNum = parseInt(lastCorporate.memberId.substring(1));
      nextNum = Math.max(lastNum + 1, 10000);
    }
    memberId = `C${nextNum}`;
  } else if (membershipType === 'Individual Member' || membershipType === 'INDIVIDUAL') {
    const lastIndividual = await User.findOne({ memberId: { $regex: /^I\d+$/ } }).sort({ memberId: -1 });
    let nextNum = 10000;
    if (lastIndividual && lastIndividual.memberId) {
      const lastNum = parseInt(lastIndividual.memberId.substring(1));
      nextNum = Math.max(lastNum + 1, 10000);
    }
    memberId = `I${nextNum}`;
  } else if (membershipType === 'Special Honorary Member' || membershipType === 'SPECIAL HONORARY') {
    const lastSpecialHonorary = await User.findOne({ memberId: { $regex: /^S\d+$/ } }).sort({ memberId: -1 });
    let nextNum = 10000;
    if (lastSpecialHonorary && lastSpecialHonorary.memberId) {
      const lastNum = parseInt(lastSpecialHonorary.memberId.substring(1));
      nextNum = Math.max(lastNum + 1, 10000);
    }
    memberId = `S${nextNum}`;
  } else {
    // Honorary Member or default
    const lastHonorary = await User.findOne({ memberId: { $regex: /^H\d+$/ } }).sort({ memberId: -1 });
    let nextNum = 10000;
    if (lastHonorary && lastHonorary.memberId) {
      const lastNum = parseInt(lastHonorary.memberId.substring(1));
      nextNum = Math.max(lastNum + 1, 10000);
    }
    memberId = `H${nextNum}`;
  }
  
  return memberId;
}

export async function POST(request) {
  try {
    console.log('Starting upload process...');
    await connectDB();
    console.log('Database connected successfully');
    
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      console.log('No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    console.log('File received:', file.name, 'Size:', file.size);

    // Read Excel file
    console.log('Reading Excel file...');
    const buffer = await file.arrayBuffer();
    console.log('Buffer size:', buffer.byteLength);
    
    const xlsxModule = await getXLSX();
    const workbook = xlsxModule.read(buffer, { type: 'array' });
    console.log('Workbook created, sheet names:', workbook.SheetNames);
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      console.log('No worksheets found');
      return NextResponse.json({ error: 'No worksheets found in Excel file' }, { status: 400 });
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    console.log('Using sheet:', sheetName);
    
    if (!worksheet) {
      console.log('Worksheet not found');
      return NextResponse.json({ error: 'Worksheet not found' }, { status: 400 });
    }
    
    const data = xlsxModule.utils.sheet_to_json(worksheet, { 
      header: 1, // Use first row as headers
      defval: '' // Default value for empty cells
    });
    console.log('Raw data rows:', data.length);
    
    // Convert array of arrays to array of objects
    if (data.length < 2) {
      console.log('Not enough data rows');
      return NextResponse.json({ error: 'Excel file must have at least a header row and one data row' }, { status: 400 });
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    console.log('Headers:', headers);
    console.log('Data rows:', rows.length);
    
    // Convert to objects with column mapping
    const processedData = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        if (header) {
          // Clean header name (remove extra spaces)
          const cleanHeader = header.trim();
          
          // Map your Excel columns to expected field names
          let fieldName = cleanHeader;
          switch (cleanHeader) {
            case 'S No':
              // Skip this column
              return;
            case 'memberId':
            case ' memberId':
              fieldName = 'memberId';
              break;
            case 'name':
            case ' name':
              fieldName = 'name';
              break;
            case 'profession':
              fieldName = 'profession';
              break;
            case 'companyName':
            case ' companyName':
              fieldName = 'companyName';
              break;
            case 'civilId':
              fieldName = 'civilId';
              break;
            case 'nationality':
            case 'nationality ':
              fieldName = 'nationality';
              break;
            case 'passportNumber':
            case 'PASSPORT NUMBER':
              fieldName = 'passportNumber';
              break;
            case 'mobile':
            case 'Mobile 1':
            case 'mobile1':
              fieldName = 'mobile';
              break;
            case 'mobile2':
            case 'Mobile 2':
              fieldName = 'alternateMobile';
              break;
            case 'email':
            case 'EMAIL ID - 1':
            case 'email1':
              fieldName = 'email';
              break;
            case 'email2':
            case 'EMAIL ID - 2':
              fieldName = 'alternateEmail';
              break;
            case 'industrySector':
            case 'Industry /Sector - Primary':
              fieldName = 'industrySector';
              break;
            case 'alternateIndustrySector':
            case 'Industry /Sector - Scondary':
              fieldName = 'alternateIndustrySector';
              break;
            case 'companyBrief':
            case 'Business Brief':
              fieldName = 'companyBrief';
              break;
            case 'companyAddress':
            case 'Company Adrees/ Location':
              fieldName = 'companyAddress';
              break;
            case 'linkedin':
            case 'Personal LinkedIn Profile':
              fieldName = 'linkedin';
              break;
            case 'companyWebsite':
            case 'Company Website':
              fieldName = 'companyWebsite';
              break;
            case 'membershipType':
            case 'Membership Type':
              fieldName = 'membershipType';
              break;
            case 'designation':
            case 'Designation Title':
              fieldName = 'designation';
              break;
            default:
              // Use the clean header name as is
              fieldName = cleanHeader;
          }
          
          obj[fieldName] = String(row[index] || '').trim();
        }
      });
      return obj;
    });
    console.log('Processed data:', processedData.length, 'records');
    console.log('Sample processed row:', processedData[0]);

    if (processedData.length === 0) {
      return NextResponse.json({ error: 'No data found in Excel file' }, { status: 400 });
    }

    const results = {
      success: [],
      errors: [],
      total: processedData.length
    };

    // Track serial numbers and member IDs used in this upload to avoid duplicates
    let currentSerialNumber = 10001;
    let currentMemberIdCounters = {
      'Corporate Member': 10000,
      'Individual Member': 10000,
      'Special Honorary Member': 10000,
      'Honorary Member': 10000
    };
    
    // Get the last serial number from database
    const lastUser = await User.findOne({ uniqueId: { $regex: /^\d{5}$/ } }).sort({ uniqueId: -1 });
    if (lastUser && lastUser.uniqueId && !isNaN(Number(lastUser.uniqueId))) {
      currentSerialNumber = Math.max(Number(lastUser.uniqueId) + 1, 10001);
    }
    
    // Get the last member IDs for each type
    const memberTypes = ['Corporate Member', 'Individual Member', 'Special Honorary Member', 'Honorary Member'];
    for (const type of memberTypes) {
      let prefix = 'H'; // Default
      if (type === 'Corporate Member') prefix = 'C';
      else if (type === 'Individual Member') prefix = 'I';
      else if (type === 'Special Honorary Member') prefix = 'S';
      
      const lastMember = await User.findOne({ memberId: { $regex: new RegExp(`^${prefix}\\d+$`) } }).sort({ memberId: -1 });
      if (lastMember && lastMember.memberId) {
        const lastNum = parseInt(lastMember.memberId.substring(1));
        currentMemberIdCounters[type] = Math.max(lastNum + 1, 10000);
      }
    }

    // Process each row
    console.log('Starting to process', processedData.length, 'rows...');
    for (let i = 0; i < processedData.length; i++) {
      const row = processedData[i];
      const rowNumber = i + 2; // Excel row number (accounting for header)
      
      console.log(`Processing row ${rowNumber}:`, row.name || 'Unknown');

      try {
        // Validate required fields
        const requiredFields = ['name', 'email', 'mobile', 'companyName', 'profession', 'memberId'];
        const missingFields = requiredFields.filter(field => !row[field] || String(row[field] || '').trim() === '');
        
        if (missingFields.length > 0) {
          console.log(`Row ${rowNumber} missing fields:`, missingFields);
          console.log(`Row ${rowNumber} data:`, row);
          results.errors.push({
            row: rowNumber,
            error: `Missing required fields: ${missingFields.join(', ')}. Available fields: ${Object.keys(row).join(', ')}`
          });
          continue;
        }

        // Check if member already exists
        const existingMember = await User.findOne({ 
          $or: [
            { email: String(row.email || '').trim().toLowerCase() },
            { memberId: String(row.memberId || '').trim() }
          ]
        });

        if (existingMember) {
          results.errors.push({
            row: rowNumber,
            error: `Member already exists with email: ${row.email} or memberId: ${row.memberId}`
          });
          continue;
        }

        // Generate serial number and new member ID
        const serialNumber = String(currentSerialNumber).padStart(5, '0');
        currentSerialNumber++; // Increment for next member
        
        // Generate member ID based on membership type
        const membershipType = String(row.membershipType || 'Individual Member').trim();
        let memberIdPrefix = 'H'; // Default
        if (membershipType === 'Corporate Member' || membershipType === 'CORPORATE') {
          memberIdPrefix = 'C';
        } else if (membershipType === 'Individual Member' || membershipType === 'INDIVIDUAL') {
          memberIdPrefix = 'I';
        } else if (membershipType === 'Special Honorary Member' || membershipType === 'SPECIAL HONORARY') {
          memberIdPrefix = 'S';
        }
        
        const memberIdNumber = currentMemberIdCounters[membershipType] || currentMemberIdCounters['Individual Member'];
        const newMemberId = `${memberIdPrefix}${memberIdNumber}`;
        currentMemberIdCounters[membershipType] = (currentMemberIdCounters[membershipType] || currentMemberIdCounters['Individual Member']) + 1;

        // Generate password
        const rawPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // Create user
        console.log('Creating user for:', row.name);
        const user = new User({
          name: String(row.name || '').trim(),
          email: String(row.email || '').trim().toLowerCase(),
          password: hashedPassword,
          role: 'member',
          uniqueId: serialNumber,
          memberId: newMemberId,
          companyName: String(row.companyName || '').trim(),
          profession: String(row.profession || '').trim(),
          designation: String(row.designation || '').trim(),
          businessActivity: String(row.businessActivity || '').trim(),
          sponsorName: String(row.sponsorName || '').trim(),
          passportNumber: String(row.passportNumber || '').trim(),
          civilId: String(row.civilId || '').trim(),
          address: String(row.address || '').trim(),
          officePhone: String(row.officePhone || '').trim(),
          residencePhone: String(row.residencePhone || '').trim(),
          mobile: String(row.mobile || '').trim(),
          benefitFromIbpc: String(row.benefitFromIbpc || '').trim(),
          contributeToIbpc: String(row.contributeToIbpc || '').trim(),
          proposer1: String(row.proposer1 || '').trim(),
          proposer2: String(row.proposer2 || '').trim(),
          companyBrief: String(row.companyBrief || '').trim(),
          about: String(row.about || '').trim(),
          nationality: String(row.nationality || '').trim(),
          membershipType: String(row.membershipType || 'Individual Member').trim(),
          alternateMobile: String(row.alternateMobile || '').trim(),
          alternateEmail: String(row.alternateEmail || '').trim(),
          industrySector: String(row.industrySector || '').trim(),
          alternateIndustrySector: String(row.alternateIndustrySector || '').trim(),
          companyAddress: String(row.companyAddress || '').trim(),
          companyWebsite: String(row.companyWebsite || '').trim(),
          membershipValidity: String(row.membershipValidity || '').trim(),
          social: {
            linkedin: String(row.linkedin || '').trim(),
            instagram: String(row.instagram || '').trim(),
            twitter: String(row.twitter || '').trim(),
            facebook: String(row.facebook || '').trim()
          }
        });

        console.log('Saving user to database...');
        await user.save();
        console.log('User saved successfully:', user.name, 'ID:', user._id);

        // Send email notification
        let emailStatus = 'not_sent';
        let emailError = null;
        try {
          await sendMail({
            to: user.email,
            subject: 'Your New IBPC Kuwait MMS Login Credentials',
            text: `Dear ${user.name},\n\nWe are excited to inform you that the Indian Business & Professional Council (IBPC) Kuwait has launched its new Membership Management System (MMS) to better serve our valued members.\n\nAs you are already a registered member of IBPC, we have created your account on this new system. Please find your login details below:\n\n• Member ID: ${newMemberId}\n• Serial No: ${serialNumber}\n• Username: ${user.email}\n• Password: ${rawPassword}\n• Login Portal: https://mms.ibpckuwait.org\n\n👉 For security reasons, we strongly recommend that you log in at your earliest convenience and reset your password.\n\nWith the new MMS, you can now:\n• Access the Members Directory and view fellow professionals\n• Manage your membership profile easily online\n• Explore exclusive opportunities offered to IBPC members\n\n📩 Need Help?\n• Email: admin@ibpckuwait.org\n• Phone/WhatsApp: +965 9958 6968\n\n🀀 Visit our website: www.ibpckuwait.org for more information and upcoming updates.\n\nWe thank you for being a valued member of IBPC Kuwait and look forward to your active participation on our new platform.\n\nWarm regards,\nMembership Team\nIndian Business & Professional Council (IBPC) Kuwait`,
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
      .header { background: #061E3E; color: #fff; padding: 20px 24px; }
      .header h1 { margin: 0; font-size: 18px; }
      .content { padding: 24px; line-height: 1.6; color: #374151; }
      .section-title { font-size: 14px; font-weight: 700; color: #111827; margin: 16px 0 8px; }
      .list { padding-left: 16px; margin: 8px 0 16px; }
      .list li { margin: 4px 0; }
      .kbd { display: inline-block; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; padding: 2px 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; }
      .cta { display: inline-block; background: #061E3E; color: white; text-decoration: none; padding: 10px 14px; border-radius: 8px; font-weight: 600; }
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
          <p>Dear ${user.name},</p>
          <p>
            We are excited to inform you that the <b>Indian Business & Professional Council (IBPC) Kuwait</b>
            has launched its new <b>Membership Management System (MMS)</b> to better serve our valued members.
          </p>
          <p>
            As you are already a registered member of IBPC, we have created your account on this new system.
            Please find your login details below:
          </p>
          <ul class="list">
            <li><strong>Member ID:</strong> <span class="kbd">${newMemberId}</span></li>
            <li><strong>Serial No:</strong> <span class="kbd">${serialNumber}</span></li>
            <li><strong>Username:</strong> <span class="kbd">${user.email}</span></li>
            <li><strong>Password:</strong> <span class="kbd">${rawPassword}</span></li>
            <li><strong>Login Portal:</strong> <a href="https://mms.ibpckuwait.org" target="_blank" rel="noopener">https://mms.ibpckuwait.org</a></li>
          </ul>
          <p>
            👉 For security reasons, we strongly recommend that you log in at your earliest convenience
            and <b>reset your password.</b>
          </p>
          <div style="margin: 16px 0;">
            <a href="https://mms.ibpckuwait.org" target="_blank" rel="noopener" class="cta">Access MMS Portal</a>
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
          emailStatus = 'sent';
          console.log(`✅ Email sent successfully to ${user.email}`);
        } catch (emailError) {
          emailStatus = 'failed';
          console.error(`❌ Failed to send email to ${user.email}:`, emailError.message);
        }

        results.success.push({
          row: rowNumber,
          name: user.name,
          email: user.email,
          memberId: newMemberId,
          serialNumber: serialNumber,
          emailStatus: emailStatus,
          emailError: emailError ? emailError.message : null
        });

      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        results.errors.push({
          row: rowNumber,
          error: error.message,
          details: error.stack
        });
      }
    }

    console.log('Upload completed. Success:', results.success.length, 'Errors:', results.errors.length);
    return NextResponse.json({
      message: 'Upload completed',
      results
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
