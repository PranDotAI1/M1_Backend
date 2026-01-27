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

    // Only save required fields with correct mapping
    const userDetails = {
      f_name: details.firstName || details.f_name || '',
      m_name: details.middleName || details.m_name || '',
      l_name: details.lastName || details.l_name || '',
      name: details.name || details.fullName || '',
      mobile: details.mobile || '',
      dob: details.dob || `${details.yearOfBirth || ''}-${details.monthOfBirth || ''}-${details.dayOfBirth || ''}`,
      address: details.address || '',
      ABHANumber: details.ABHANumber || details.abha || '',
      abhaaddress: details.abhaaddress || details.phrAddress || details.preferredAbhaAddress || '',
      gender: details.gender || details.gander || '', // Handle both spellings
      status: details.status || details.abhaStatus || '',
      pincode: details.pincode || '',
      createdAt: details.createdAt || new Date()
    };

    // Use ABHANumber and mobile as unique identifiers
    const searchQuery = {
      $or: [
        { ABHANumber: userDetails.ABHANumber },
        { mobile: userDetails.mobile }
      ]
    };

    const existingUser = await User.findOne(searchQuery);
    if (existingUser) {
      await User.findByIdAndUpdate(existingUser._id, userDetails);
      console.log('✅ User updated with new fields:', userDetails.ABHANumber);
    } else {
      await User.create(userDetails);
      console.log('✅ New user created with fields:', userDetails.ABHANumber);
    }

    return true;
  } catch (err) {
    console.error('❌ Error saving user details:', err.message);
    await ErrorLog.create({
      api: 'saveUserDetails',
      error: err.message,
      response: details
    });
    return false;
  }
}

