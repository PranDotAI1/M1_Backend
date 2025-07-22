import User from '../models/user.js';

export async function saveUserDetails(details) {
  const query = {};
  if (details.mobile) query.mobile = details.mobile;
  if (details.aadhar) query.aadhar = details.aadhar;
  if (details.abha) query.abha = details.abha;
  if (details.dl) query.dl = details.dl;

  const exists = await User.findOne(query);
  if (!exists) {
    await User.create(details);
    return true;
  }
  return false;
}
