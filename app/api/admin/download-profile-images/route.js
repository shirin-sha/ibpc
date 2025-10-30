import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { PassThrough, Readable } from 'stream';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const profileImagesDirectoryPath = path.join(process.cwd(), 'public', 'profileimages');

    if (!fs.existsSync(profileImagesDirectoryPath)) {
      return NextResponse.json({ error: 'profileimages directory not found' }, { status: 404 });
    }

    const passThroughStream = new PassThrough();

    const zipArchive = archiver('zip', { zlib: { level: 9 } });
    zipArchive.on('error', (error) => {
      passThroughStream.destroy(error);
    });

    // Start piping archive to the pass-through stream
    zipArchive.pipe(passThroughStream);
    // Add the directory contents at the root of the zip
    zipArchive.directory(profileImagesDirectoryPath, false);
    // Finalize the archive (no more files to add)
    void zipArchive.finalize();

    // Convert Node stream to Web stream for Response
    const webStream = Readable.toWeb(passThroughStream);

    return new Response(webStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="profileimages.zip"',
        'Cache-Control': 'no-store',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate zip' }, { status: 500 });
  }
}


