const { google } = require('googleapis');

export default GoogleOAuth = ({ userId }) => {
  const user = Meteor.users.findOne(userId);
  if (!user) throw new Error('User not found');

  const accessToken = user.services && user.services.google && user.services.google.accessToken;
  if (!accessToken) throw new Error('User does not have Google account');

  const oauth2Client = new google.auth.OAuth2(process.env.OAUTH_CLIENT_ID, process.env.OAUTH_CLIENT_SECRET,  'http://localhost:3000/_oauth/google');
  oauth2Client.credentials = { access_token: accessToken };

  return oauth2Client;
};
