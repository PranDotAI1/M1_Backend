import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // ABHA Profile Fields
  ABHANumber: { type: String, unique: true, sparse: true },
  preferredAbhaAddress: String,
  mobile: { type: String, unique: true, sparse: true },
  mobileVerified: Boolean,
  firstName: String,
  middleName: String,
  lastName: String,
  name: String,
  yearOfBirth: String,
  dayOfBirth: String,
  monthOfBirth: String,
  gender: String,
  profilePhoto: String,
  status: String,
  stateCode: String,
  districtCode: String,
  pincode: String,
  address: String,
  authMethods: [String],
  stateName: String,
  districtName: String,
  subdistrictName: String,
  townName: String,
  tags: mongoose.Schema.Types.Mixed,
  kycVerified: Boolean,
  verificationStatus: String,
  verificationType: String,
  source: String,
  createdDate: String,
  
  // Additional Fields
  aadhar: { type: String, unique: true, sparse: true },
  dl: { type: String, unique: true, sparse: true },
  email: String,
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'users', // Explicitly set collection name
  strict: false // Allow additional fields from the API response
});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
