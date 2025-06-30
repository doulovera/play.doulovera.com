import SpotifyWebApi from 'spotify-web-api-node';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const spotifyApi = new SpotifyWebApi({
    clientId: config.spotify.clientId,
    clientSecret: config.spotify.clientSecret,
    redirectUri: config.spotify.redirectUri
  });

  const scopes = ['user-read-currently-playing'];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);

  await sendRedirect(event, authorizeURL);
});