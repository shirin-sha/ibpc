// lib/b2Client.js - AWS SDK v3 (modular, much smaller bundle size)
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Create S3 client instance
const s3Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT,
  region: 'auto', // B2 uses 'auto' for region
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
  forcePathStyle: true, // Required for B2
});

// Helper function to upload object to B2
export async function putObject({ Bucket, Key, Body, ContentType }) {
  const command = new PutObjectCommand({
    Bucket,
    Key,
    Body,
    ContentType,
  });
  await s3Client.send(command);
}

// Helper function to generate signed URL for getting objects
export async function getSignedObjectUrl({ Bucket, Key, Expires }) {
  const command = new GetObjectCommand({ Bucket, Key });
  return await getSignedUrl(s3Client, command, { expiresIn: Expires });
}

// Export the client for any custom operations
export default s3Client;