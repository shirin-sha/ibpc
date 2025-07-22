// lib/b2Client.js
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  endpoint: process.env.B2_ENDPOINT,
  accessKeyId: process.env.B2_KEY_ID,
  secretAccessKey: process.env.B2_APPLICATION_KEY,
  signatureVersion: 'v4',
  s3ForcePathStyle: true, // Required for B2
});

export default s3;