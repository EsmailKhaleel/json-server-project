const { OAuth2Client } = require('google-auth-library');

// Create OAuth2 client for server-side flow
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
);

// Generate Google OAuth URL for server-side flow
const getGoogleAuthURL = () => {
  const authUrl = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    prompt: 'consent'
  });
  return authUrl;
};

// Exchange authorization code for tokens
const getTokensFromCode = async (code) => {
  try {
    const { tokens } = await googleClient.getToken(code);
    return tokens;
  } catch (error) {
    throw new Error('Failed to exchange code for tokens');
  }
};

// Get user info from Google using access token
const getGoogleUserInfo = async (accessToken) => {
  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
    const userInfo = await response.json();
    return userInfo;
  } catch (error) {
    throw new Error('Failed to get user info from Google');
  }
};

module.exports = {
  googleClient,
  getGoogleAuthURL,
  getTokensFromCode,
  getGoogleUserInfo
}; 