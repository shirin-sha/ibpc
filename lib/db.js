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
        // poolSize and other options are auto-managed in Mongoose 6+
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 15000,
      })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;