import User from '../models/user.js';
import ErrorLog from '../models/error_log.js';
import mongoose from 'mongoose';
import { generateUHID } from './uhidGenerator.js';

async function ensureConnection() {
  if (mongoose.connection.readyState !== 1) {
    await new Promise(resolve => {
      mongoose.connection.once('connected', resolve);
    });
  }
}

// Helper function to check if UHID already exists in database
async function isUHIDExists(uhid) {
  const existingUHID = await User.findOne({ uhid });
  return !!existingUHID;
}

// Helper function to generate unique UHID with retry mechanism
async function generateUniqueUHID(maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    const uhid = generateUHID();
    const exists = await isUHIDExists(uhid);
    if (!exists) {
      return uhid;
    }
    console.warn(`⚠️ UHID collision detected, retrying... (Attempt ${i + 1}/${maxRetries})`);
  }
  throw new Error('Failed to generate unique UHID after maximum retries');
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

    // Search for existing user by ABHANumber only (mobile may be shared between patients)
    const searchQuery = {
      ABHANumber: userDetails.ABHANumber
    };

    const existingUser = await User.findOne(searchQuery);

    if (existingUser) {
      // Check if name and ABHA number are the same; do NOT use mobile for UHID validation
      const isSameData = 
        existingUser.name === userDetails.name &&
        existingUser.ABHANumber === userDetails.ABHANumber;

      if (isSameData) {
        // Same data - update with new details using existing UHID
        // If existing user doesn't have a UHID, generate one now
        if (!existingUser.uhid) {
          const newUHID = await generateUniqueUHID();
          userDetails.uhid = newUHID;
          console.warn('⚠️ Existing user had undefined UHID, generated new one:', newUHID);
        } else {
          userDetails.uhid = existingUser.uhid;
        }
        await User.findByIdAndUpdate(existingUser._id, userDetails, { runValidators: true });
        console.log('✅ User updated with existing UHID:', userDetails.uhid, '| ABHA:', userDetails.ABHANumber);
      } else {
        // Different data - generate new unique UHID and CREATE a NEW record
        // (Do NOT update the existing record; preserve historical patient entry)
        const newUHID = await generateUniqueUHID();
        userDetails.uhid = newUHID;
        const createdNew = await User.create(userDetails);
        console.log('✅ New user record created for differing name with UHID:', newUHID, '(Preserved previous UHID: ' + existingUser.uhid + ')' + ' | ABHA:', userDetails.ABHANumber);
      }
    } else {
      // New user - generate unique UHID and create
      const newUHID = await generateUniqueUHID();
      userDetails.uhid = newUHID;
      const createdUser = await User.create(userDetails);
      console.log('✅ New user created with UHID:', newUHID, '| ABHA:', userDetails.ABHANumber);
    }

    return true;
  } catch (err) {
    const errorMsg = err.message;
    
    // Handle duplicate UHID error
    if (err.code === 11000 && err.keyPattern?.uhid) {
      console.error('❌ UHID uniqueness violation:', errorMsg);
      await ErrorLog.create({
        api: 'saveUserDetails',
        error: 'UHID Uniqueness Violation - ' + errorMsg,
        response: details,
        type: 'UHID_DUPLICATE'
      });
    } else {
      console.error('❌ Error saving user details:', errorMsg);
      await ErrorLog.create({
        api: 'saveUserDetails',
        error: errorMsg,
        response: details
      });
    }
    return false;
  }
}

