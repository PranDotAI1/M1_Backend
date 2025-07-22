import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  mobile: { type: String, unique: true, sparse: true },
  aadhar: { type: String, unique: true, sparse: true },
  abha: { type: String, unique: true, sparse: true },
  dl: { type: String, unique: true, sparse: true },
  name: String,
  email: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
