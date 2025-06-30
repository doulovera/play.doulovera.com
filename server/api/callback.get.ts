import SpotifyWebApi from 'spotify-web-api-node';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { code } = getQuery(event);

  const spotifyApi = new SpotifyWebApi({
    clientId: config.spotify.clientId,
    clientSecret: config.spotify.clientSecret,
    redirectUri: config.spotify.redirectUri
  });

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;

    console.log('The refresh token is:', refresh_token);

    return `Success! You can now close this tab. Your refresh token has been logged to the console.`;

  } catch (error) {
    console.error('Error in callback API route:', error);
    return 'Error retrieving tokens.';
  }
});