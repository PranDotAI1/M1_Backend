export const extractToken = (resp) => {
  if (!resp) return null;
  return (
    resp.xToken ||
    resp.token ||
    resp.tokens?.token ||
    resp.data?.tokens?.token ||
    resp.data?.token ||
    resp.data?.xToken ||
    resp.headers?.['x-token'] ||
    resp.headers?.['xtoken'] ||
    resp.headers?.['X-token'] ||
    null
  );
};

export const COOKIE_NAME = 'xToken';

export const setXTokenCookie = (res, token) => {
  if (!token) return;
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 30 * 60 * 1000,
    path: '/',
  };
  res.cookie(COOKIE_NAME, token, cookieOptions);
};

export const getXToken = (req) => {
  return (
    req.cookies?.[COOKIE_NAME] ||
    req.cookies?.['xToken'] ||
    req.cookies?.['x-token'] ||
    req.cookies?.['x_token'] ||
    req.cookies?.['xtoken'] ||
    req.headers?.['xtoken'] ||
    req.headers?.['x-token'] ||
    req.headers?.['X-token']
  );
};

export const clearXTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };
  res.clearCookie(COOKIE_NAME, cookieOptions);
  // Also clear legacy cookie names in case old sessions linger in the browser
  res.clearCookie('x-token', cookieOptions);
  res.clearCookie('x_token', cookieOptions);
  res.clearCookie('xtoken', cookieOptions);
};

export default {
  extractToken,
  setXTokenCookie,
  clearXTokenCookie,
  getXToken,
};
