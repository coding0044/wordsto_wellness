export const ExternalUrls = {
  google: {
    oauthAuthorize: 'https://accounts.google.com/o/oauth2/v2/auth',
    userInfo: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scope: 'email profile',
    prompt: 'select_account',
    buildAuthorizeUrl: (clientId: string, redirectUri: string) =>
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token&scope=${encodeURIComponent(ExternalUrls.google.scope)}` +
      `&prompt=${encodeURIComponent(ExternalUrls.google.prompt)}`,
  },
};
