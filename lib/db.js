import mongoose from 'mongoose';

let cached = global._mongooseCached;
if (!cached) {
  cached = global._mongooseCached = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not set');
    mongoose.set('strictQuery', false);
    cached.promise = mongoose
      .connect(uri, {
        // Optimized for faster login redirects
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000, // Reduced from 15s to 5s for faster failures
        connectTimeoutMS: 5000, // Add connection timeout
        socketTimeoutMS: 10000, // Add socket timeout
        bufferCommands: false, // Disable buffering for faster responses
      })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;