// lib/localStorage.js - Persistent file system storage for images
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In production, write into Next.js public folder mounted via Coolify
// Destination paths expected to be mounted:
//   /app/public/profileimages
//   /app/public/companylogos
const isProduction = process.env.NODE_ENV === 'production';
const projectRoot = path.join(__dirname, '..');

// Helper function to upload file to local storage
async function uploadFile(file, folder = 'profileimages', memberId = null, uniqueId = null, imageType = null) {
  try {
    // Validate folder
    const allowedFolders = ['profileimages', 'companylogos'];
    if (!allowedFolders.includes(folder)) {
      throw new Error(`Invalid folder: ${folder}. Allowed folders: ${allowedFolders.join(', ')}`);
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(projectRoot, 'public', folder);
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate filename: memberId-uniqueId-imageType.extension
    const ext = path.extname(file.name).toLowerCase() || '.jpg';
    
    let filename;
    if (memberId && uniqueId && imageType) {
      filename = `${memberId}-${uniqueId}-${imageType}${ext}`;
    } else {
      // Fallback with timestamp for safety
      filename = `${folder}-${Date.now()}${ext}`;
    }
    
    const filePath = path.join(uploadDir, filename);
    
    // Delete previous file if it exists (clean replacement)
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File doesn't exist, that's fine
    }
    
    // Save new file
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Always return API route URL for production compatibility
    return `/api/files/${folder}/${filename}`;
  } catch (error) {
    console.error('Local file upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

// Helper function to delete file from local storage
async function deleteFile(filePath) {
  try {
    if (!filePath) return;
    
    // Extract filename from path (e.g., "/profileimages/photo-123.jpg" -> "photo-123.jpg")
    const filename = path.basename(filePath);
    const folder = filePath.includes('/companylogos/') ? 'companylogos' : 'profileimages';
    
    const fullPath = path.join(projectRoot, 'public', folder, filename);
    
    // Check if file exists before deleting
    try {
      await fs.access(fullPath);
      await fs.unlink(fullPath);
      console.log(`Deleted file: ${fullPath}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`File not found (already deleted): ${fullPath}`);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Local file deletion error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

// Helper function to get file URL (for consistency with S3 API)
function getFileUrl(filePath) {
  if (!filePath) return null;
  
  // If it's already a public URL path, return as is
  if (filePath.startsWith('/')) {
    return filePath;
  }
  
  // If it's just a filename, assume it's in profileimages folder
  return `/api/files/profileimages/${filePath}`;
}

// Helper function to check if file exists
async function fileExists(filePath) {
  try {
    if (!filePath) return false;
    
    const filename = path.basename(filePath);
    const folder = filePath.includes('/companylogos/') ? 'companylogos' : 'profileimages';
    const fullPath = path.join(projectRoot, 'public', folder, filename);
    
    await fs.access(fullPath);
    return true;
  } catch (error) {
    return false;
  }
}

export {
  uploadFile,
  deleteFile,
  getFileUrl,
  fileExists
};
