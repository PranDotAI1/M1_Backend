import mobilelogin from '../models/singleapi.js';
import path from 'path';
import fs from 'fs';

export const requestLoginOtp = async (req, res) => {
  try {
    const { loginId } = req.body;
    const access_token = req.headers['accesstoken'];
    if (!loginId || !access_token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mobile number and accesstoken is required' 
      });
    }
    
    const response = await mobilelogin.requestLoginOtp(access_token, loginId);
    
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
    
    const response = await mobilelogin.verifyLoginOtp({accessToken, txnId, otp });
    
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

