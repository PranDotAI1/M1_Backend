import User from '../models/user.js';
import ErrorLog from '../models/error_log.js';
import mongoose from 'mongoose';

async function ensureConnection() {
  if (mongoose.connection.readyState !== 1) {
    await new Promise(resolve => {
      mongoose.connection.once('connected', resolve);
    });
  }
}

export async function saveUserDetails(details) {
  try {
    await ensureConnection();

    // Keep all original fields and add any additional mapped fields
    const userDetails = {
      ...details,  // Preserve all original fields
      mobile: details.mobile || details.mobileNumber,
      aadhar: details.aadhar || details.aadhaar || details.aadhaarNumber,
      abha: details.abha || details.ABHANumber || details.abhaNumber,
      dl: details.dl || details.DL_number,
      name: details.name || [details.First_Name, details.Middle_Name, details.Last_Name].filter(Boolean).join(' '),
      email: details.email,
      mobileVerified: details.mobileVerified,
      verificationStatus: details.verificationStatus,
      verificationType: details.verificationType,
      kycVerified: details.kycVerified,
      authMethods: details.authMethods || [],
      profilePhoto: details.profilePhoto,
      kycPhoto: details.kycPhoto,
      status: details.status,
      gender: details.gender,
      yearOfBirth: details.yearOfBirth,
      dayOfBirth: details.dayOfBirth,
      monthOfBirth: details.monthOfBirth,
      address: details.address,
      pincode: details.pincode,
      stateCode: details.stateCode,
      stateName: details.stateName,
      districtCode: details.districtCode,
      districtName: details.districtName,
      subdistrictName: details.subdistrictName,
      townName: details.townName,
      createdAt: details.createdAt || new Date()
    };

    // Build search query
    const searchQuery = { $or: [] };
    for (const field of ['mobile', 'aadhar', 'abha', 'dl']) {
      if (userDetails[field]) {
        searchQuery.$or.push({ [field]: userDetails[field] });
      }
    }

    if (!searchQuery.$or.length) {
      await ErrorLog.create({
        api: 'saveUserDetails',
        error: 'No unique identifier provided in user details',
        response: details
      });
      return false;
    }

    const existingUser = await User.findOne(searchQuery);
    
    if (existingUser) {
      await User.findByIdAndUpdate(existingUser._id, userDetails);
    } else {
      await User.create(userDetails);
    }

    return true;
  } catch (err) {
    await ErrorLog.create({
      api: 'saveUserDetails',
      error: err.message,
      response: details
    });
    return false;
  }
}

