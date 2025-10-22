// app/api/files/[...path]/route.js
import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

const persistentStoragePath = process.env.PERSISTENT_STORAGE_PATH || '/app/public';

export async function GET(req, { params }) {
  try {
    const pathSegments = await params.path;
    
    // Ensure we have valid path segments
    if (!pathSegments || pathSegments.length === 0) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    const filePath = path.join(persistentStoragePath, ...pathSegments);
    
    // Security check - ensure file is within allowed directory
    const resolvedPath = path.resolve(filePath);
    const resolvedStoragePath = path.resolve(persistentStoragePath);
    
    if (!resolvedPath.startsWith(resolvedStoragePath)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    // Set appropriate content type
    const contentType = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml'
    }[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('File serving error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
