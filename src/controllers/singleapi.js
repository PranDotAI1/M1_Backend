import mobilelogin from '../models/singleapi.js';
import path from 'path';
import fs from 'fs';

export const requestLoginOtp = async (req, res) => {
  try {
    const { loginId, verify, otpsystem } = req.body;
    const access_token = req.headers['accesstoken'];
    if (!loginId || !access_token || !verify || !otpsystem) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mobile number, accesstoken, verify and otpsystem are required' 
      });
    }
    
    const response = await mobilelogin.requestLoginOtp(access_token, loginId, verify, otpsystem);
    
    res.status(200).json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    console.error('Error in requestLoginOtp controller:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while requesting login OTP',
      error: error.response || null
    });
  }
};


// Verify OTP for ABHA login

export const verifyLoginOtp = async (req, res) => {
  try {
    const { txnId, otp, verify } = req.body;
    const accessToken = req.headers['accesstoken'];
    if (!accessToken || !txnId || !otp || !verify) {
      return res.status(400).json({ 
        success: false, 
        message: 'accesstoken, txnId, otp and verify are required' 
      });
    }
    
    const response = await mobilelogin.verifyLoginOtp({accessToken, txnId, otp, verify});
    
    // Return both the data and the X-token to the frontend
    res.status(200).json({ 
      success: true, 
      data: response.data,
      xToken: response.xToken // Frontend will store this
    });
  } catch (error) {
    console.error('Error in verifyLoginOtp controller:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while verifying login OTP',
      error: error.response || null
    });
  }
};



export const searchprofile = async (req, res) => {
  try {
    const { address } = req.body;
    const access_token = req.headers['accesstoken'];
    if (!address || !access_token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Address and accesstoken is required' 
      });
    }
    
    const response = await mobilelogin.searchprofile(access_token, address);
    
    res.status(200).json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    console.error('Error in requestLoginOtp controller:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while requesting login OTP',
      error: error.response || null
    });
  }
};




export const profileAddress = async (req, res) => {
  try {
    const accessToken = req.headers['accesstoken'];
    const xToken = req.headers['xtoken'];
    if (!accessToken || !xToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'accesstoken and x-token are required' 
      });
    }
    
    const response = await mobilelogin.profileAddress({accessToken, xToken });
    // Attempt to save profile into DB (best-effort)
    try {
      // Compute age using year/month/day if available, otherwise parse dateOfBirth
      const computeAge = (year, month, day, dateString) => {
        const today = new Date();
        if (year) {
          const y = Number(year);
          const m = month ? Number(month) - 1 : 0;
          const d = day ? Number(day) : 1;
          const birth = new Date(y, m, d);
          if (isNaN(birth)) return null;
          let age = today.getFullYear() - birth.getFullYear();
          const mDiff = today.getMonth() - birth.getMonth();
          if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) age--;
          return age >= 0 ? age : null;
        }
        if (dateString) {
          const parsed = new Date(dateString);
          if (!isNaN(parsed)) {
            let age = today.getFullYear() - parsed.getFullYear();
            const mDiff = today.getMonth() - parsed.getMonth();
            if (mDiff < 0 || (mDiff === 0 && today.getDate() < parsed.getDate())) age--;
            return age >= 0 ? age : null;
          }
        }
        return null;
      };

      const age = computeAge(
        response.data.yearOfBirth,
        response.data.monthOfBirth,
        response.data.dayOfBirth,
        response.data.dateOfBirth
      );

      const userDetailsForSaving = {
        firstName: response.data.firstName,
        middleName: response.data.middleName,
        lastName: response.data.lastName,
        name: response.data.fullName,
        mobile: response.data.mobile,
        gender: response.data.gender,
        yearOfBirth: response.data.yearOfBirth,
        monthOfBirth: response.data.monthOfBirth,
        dayOfBirth: response.data.dayOfBirth,
        dob: response.data.dateOfBirth,
        age: age,
        address: response.data.address,
        ABHANumber: response.data.abhaNumber,
        abhaaddress: response.data.phrAddress || response.data.preferredAbhaAddress || response.data.abhaAddress,
        status: response.data.status,
        pincode: response.data.pinCode,
        
        // include raw response as fallback
        ...response.data
      };

      const { saveUserDetails } = await import('../utils/userSaver.js');
      await saveUserDetails(userDetailsForSaving);
      console.log('✅ User profile saved successfully for ABHA:', userDetailsForSaving.ABHANumber);
    } catch (saveError) {
      console.error('❌ Error saving user profile from profileAddress:', saveError.message || saveError);
      const { logError } = await import('../utils/errorLogger.js');
      await logError('singleapi/profileAddress/saveUser', saveError.message || String(saveError), response.data);
    }

    // Return both the data and the X-token to the frontend
    res.status(200).json({ 
      success: true, 
      data: response.data,
    });
  } catch (error) {
    console.error('Error in verifyLoginOtp controller:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while verifying login OTP',
      error: error.response || null
    });
  }
};


export const CardbyAddress = async (req, res) => {
  try {
    const accessToken = req.headers['accesstoken'];
    const xToken = req.headers['xtoken'];
    
    if (!accessToken || !xToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'accesstoken and xtoken are required in request headers' 
      });
    }
    
    try {
      // Call the service to download the PHR card
      const response = await mobilelogin.CardbyAddress({ accessToken, xToken });
      
      // Check for different possible file extensions
      const cardDirectory = path.join(process.cwd(), './abha_cards');
      const possibleExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
      let cardPath = null;
      let contentType = 'application/pdf'; // Default to PDF
      let filename = 'phr_card.pdf'; // Default filename
      
      // Find the actual file that was downloaded
      for (const ext of possibleExtensions) {
        const testPath = path.join(cardDirectory, `phr_card_by_address.${ext}`);
        if (fs.existsSync(testPath)) {
          cardPath = testPath;
          
          // Set appropriate content type and filename based on extension
          switch (ext) {
            case 'pdf':
              contentType = 'application/pdf';
              filename = 'phr_card.pdf';
              break;
            case 'png':
              contentType = 'image/png';
              filename = 'phr_card.png';
              break;
            case 'jpg':
            case 'jpeg':
              contentType = 'image/jpeg';
              filename = `phr_card.${ext}`;
              break;
          }
          break;
        }
      }
      
      // Check if file exists
      if (!cardPath || !fs.existsSync(cardPath)) {
        return res.status(404).json({
          success: false,
          message: 'PHR card file not found'
        });
      }
      
      // Set appropriate headers for file response
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      
      // Send the file
      res.sendFile(cardPath);
      
    } catch (downloadError) {
      // Return the exact API error response
      return res.status(downloadError.status || 500).json({
        success: false,
        message: downloadError.message || 'An error occurred while downloading PHR card',
        error: downloadError.response || null
      });
    }

  } catch (error) {
    console.error('Error in CardbyAddress controller:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while fetching PHR card',
      error: error.response || null
    });
  }
};

export const fetchAbha = async (req, res) => {
  try {
    const { loginId } = req.body;
    const access_token = req.headers['accesstoken'];
    if (!loginId || !access_token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Abha number and accesstoken is required' 
      });
    }
    
    const response = await mobilelogin.fetchAbha(access_token, loginId);
    
    res.status(200).json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    console.error('Error in fetch Abha controller:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while login with ABHA',
      error: error.response || null
    });
  }
};


// Verify OTP for ABHA login

export const verifypass = async (req, res) => {
  try {
    console.log('Access Token:', req.headers, req.body);
    const { loginId, password } = req.body;
    const accessToken = req.headers['accesstoken'];
    console.log('Access Token:', req.headers, req.body);
    if (!accessToken || !loginId || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'accesstoken, loginId and password are required' 
      });
    }
    
    const response = await mobilelogin.verifypass({accessToken, loginId, password });
    
    // Return both the data and the X-token to the frontend
    res.status(200).json({ 
      success: true, 
      data: response.data,
      xToken: response.xToken // Frontend will store this
    });
  } catch (error) {
    console.error('Error in verify password controller:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while login with ABHA',
      error: error.response || null
    });
  }
};

