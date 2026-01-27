import abhanumberLogin from '../models/login_via_abha_number.js';
export const requestLoginOtp = async (req, res) => {
  try {
    const { abhaNumber } = req.body;
    const access_token = req.headers['accesstoken'];
    if (!abhaNumber || !access_token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Abha number and accesstoken is required' 
      });
    }
    
    const response = await abhanumberLogin.requestLoginOtp(access_token, abhaNumber);
    
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
    const { txnId, otp } = req.body;
    const accessToken = req.headers['accesstoken'];
    if (!accessToken || !txnId || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'accesstoken, txnId and otp are required' 
      });
    }
    
    const response = await abhanumberLogin.verifyLoginOtp({accessToken, txnId, otp });
    
    // Save user details if login is successful
    if (response && response.data && response.data.accounts && response.data.accounts.length > 0) {
      const acc = response.data.accounts[0];
      const userDetails = {
        mobile: response.data.mobile || acc.mobile,
        ABHANumber: acc.ABHANumber || acc.abhaNumber,
        name: acc.name,
        f_name: acc.firstName || acc.name?.split(' ')[0] || '',
        m_name: acc.middleName || acc.name?.split(' ')[1] || '',
        l_name: acc.lastName || acc.name?.split(' ').slice(-1)[0] || '',
        abhaaddress: acc.preferredAbhaAddress || acc.phrAddress,
        gender: acc.gender || acc.gander,
        status: acc.status,
        dob: acc.dateOfBirth || acc.dob,
        address: acc.address,
        pincode: acc.pincode
      };
      
      try {
        const { saveUserDetails } = await import('../utils/userSaver.js');
        await saveUserDetails(userDetails);
        console.log('✅ User details saved successfully for ABHA:', userDetails.ABHANumber);
      } catch (saveError) {
        console.error('❌ Error saving user details:', saveError.message);
      }
    }
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
