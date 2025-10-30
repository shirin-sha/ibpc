import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

export const dynamic = 'force-dynamic';

export async function GET() {
  const profileImagesDirectoryPath = path.join(process.cwd(), 'public', 'profileimages');

  if (!fs.existsSync(profileImagesDirectoryPath)) {
    return NextResponse.json({ error: 'profileimages directory not found' }, { status: 404 });
  }

  const { PassThrough } = await import('stream');
  const passThroughStream = new PassThrough();

  const headers = new Headers({
    'Content-Type': 'application/zip',
    'Content-Disposition': 'attachment; filename="profileimages.zip"',
  });

  const response = new NextResponse(passThroughStream, { headers });

  const zipArchive = archiver('zip', { zlib: { level: 9 } });

  zipArchive.on('error', (error) => {
    passThroughStream.destroy(error);
  });

  // Pipe before adding files and finalizing
  zipArchive.pipe(passThroughStream);

  // Add the directory contents at the root of the zip
  zipArchive.directory(profileImagesDirectoryPath, false);

  // Finalize the archive (no more files to add)
  void zipArchive.finalize();

  return response;
}


