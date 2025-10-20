// lib/b2Client.js - AWS SDK v3 (modular, much smaller bundle size)
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Ensure endpoint has protocol
const endpoint = process.env.B2_ENDPOINT;
const formattedEndpoint = endpoint?.startsWith('http') ? endpoint : `https://${endpoint}`;

// Create S3 client instance
const s3Client = new S3Client({
  endpoint: formattedEndpoint,
  region: 'us-east-1', // B2 accepts any valid AWS region (doesn't use 'auto' in v3)
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
  forcePathStyle: true, // Required for B2
});

// Helper function to upload object to B2
export async function putObject({ Bucket, Key, Body, ContentType }) {
  try {
    const command = new PutObjectCommand({
      Bucket,
      Key,
      Body,
      ContentType,
    });
    await s3Client.send(command);
  } catch (error) {
    console.error('B2 putObject error:', error);
    throw new Error(`Failed to upload to B2: ${error.message}`);
  }
}

// Helper function to generate signed URL for getting objects
export async function getSignedObjectUrl({ Bucket, Key, Expires }) {
  try {
    const command = new GetObjectCommand({ Bucket, Key });
    return await getSignedUrl(s3Client, command, { expiresIn: Expires });
  } catch (error) {
    console.error('B2 getSignedUrl error:', error);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
}

// Export the client for any custom operations
export default s3Client;