import crypto from 'crypto';

// In-memory store for captcha sessions (in production, use Redis or database)
const captchaSessions = new Map();

// Clean up expired captchas every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of captchaSessions.entries()) {
    if (now - value.timestamp > 10 * 60 * 1000) { // 10 minutes
      captchaSessions.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Generate a random captcha string
 * @param {number} length - Length of the captcha string
 * @returns {string} Random captcha string
 */
export const generateCaptchaText = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate a captcha session with a unique ID
 * @returns {Object} Object containing captcha text and session ID
 */
export const generateCaptchaSession = () => {
  const sessionId = crypto.randomUUID();
  const captchaText = generateCaptchaText();
  
  // Store captcha with timestamp
  captchaSessions.set(sessionId, {
    text: captchaText,
    timestamp: Date.now()
  });
  
  return {
    sessionId,
    captchaText
  };
};

/**
 * Verify a captcha against its session
 * @param {string} sessionId - Captcha session ID
 * @param {string} userInput - User's captcha input
 * @returns {boolean} True if captcha is valid
 */
export const verifyCaptcha = (sessionId, userInput) => {
  const session = captchaSessions.get(sessionId);
  
  if (!session) {
    return false; // Session expired or doesn't exist
  }
  
  // Check if captcha is expired (10 minutes)
  if (Date.now() - session.timestamp > 10 * 60 * 1000) {
    captchaSessions.delete(sessionId);
    return false;
  }
  
  // Case-insensitive comparison
  const isValid = session.text.toLowerCase() === userInput.toLowerCase();
  
  // Delete session after verification attempt (one-time use)
  captchaSessions.delete(sessionId);
  
  return isValid;
};

/**
 * Generate a simple SVG captcha image
 * @param {string} text - The captcha text to render
 * @returns {string} Base64 encoded SVG image
 */
export const generateCaptchaImage = (text) => {
  // Generate random colors
  const bgColor = `rgb(${Math.floor(Math.random() * 50 + 200)}, ${Math.floor(Math.random() * 50 + 200)}, ${Math.floor(Math.random() * 50 + 200)})`;
  const textColor = `rgb(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)})`;
  
  // Generate random noise lines
  let noiseLines = '';
  for (let i = 0; i < 5; i++) {
    const x1 = Math.random() * 200;
    const y1 = Math.random() * 60;
    const x2 = Math.random() * 200;
    const y2 = Math.random() * 60;
    const lineColor = `rgb(${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)})`;
    noiseLines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${lineColor}" stroke-width="1" opacity="0.5"/>`;
  }
  
  // Generate text with random positions and rotations
  let textElements = '';
  const charSpacing = 200 / (text.length + 1);
  
  for (let i = 0; i < text.length; i++) {
    const x = charSpacing * (i + 1);
    const y = 35 + (Math.random() - 0.5) * 10;
    const rotation = (Math.random() - 0.5) * 30;
    const fontSize = 30 + Math.random() * 10;
    
    textElements += `
      <text 
        x="${x}" 
        y="${y}" 
        font-family="Arial, sans-serif" 
        font-size="${fontSize}" 
        font-weight="bold"
        fill="${textColor}"
        transform="rotate(${rotation} ${x} ${y})"
        text-anchor="middle"
      >${text[i]}</text>
    `;
  }
  
  const svg = `
    <svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="60" fill="${bgColor}"/>
      ${noiseLines}
      ${textElements}
    </svg>
  `;
  
  // Convert SVG to base64
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
};

export default {
  generateCaptchaText,
  generateCaptchaSession,
  verifyCaptcha,
  generateCaptchaImage
};
