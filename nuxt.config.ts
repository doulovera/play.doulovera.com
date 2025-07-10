export default defineNuxtConfig({
  app: {
    head: {
      title: "Currently playing by Douglas Lovera",
    },
  },
  runtimeConfig: {
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      refreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
      redirectUri: process.env.REDIRECT_URI,
    },
  },
});
