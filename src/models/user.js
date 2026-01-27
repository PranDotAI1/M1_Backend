
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  f_name: { type: String, required: true },
  m_name: { type: String },
  l_name: { type: String },
  name: { type: String }, // Full name
  mobile: { type: String, required: true },
  dob: { type: String, required: true }, // Format: YYYY-MM-DD
  address: { type: String },
  ABHANumber: { type: String, required: true },
  abhaaddress: { type: String }, // ABHA address (PHR address)
  gender: { type: String }, // Gender field
  status: { type: String },
  pincode: { type: String },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'Patients', // Set collection name
  strict: true // Only allow defined fields
});

const UserModel = mongoose.model('Patient', userSchema);

export default UserModel;
