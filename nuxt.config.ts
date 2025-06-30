export default defineNuxtConfig({
  runtimeConfig: {
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      refreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
      redirectUri: process.env.REDIRECT_URI
    }
  }
})