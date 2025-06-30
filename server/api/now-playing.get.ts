import SpotifyWebApi from 'spotify-web-api-node';

// In-memory cache for the API response
let spotifyCache: {
  data: any;
  timestamp: number;
} | null = null;

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // Cache configuration
  const cacheTime = 30 * 1000; // 30 seconds
  
  // Check if we have cached data that's still fresh
  if (spotifyCache && 
      spotifyCache.timestamp && 
      Date.now() - spotifyCache.timestamp < cacheTime) {
    return spotifyCache.data;
  }

  const spotifyApi = new SpotifyWebApi({
    clientId: config.spotify.clientId,
    clientSecret: config.spotify.clientSecret,
    refreshToken: config.spotify.refreshToken
  });

  try {
    const data = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(data.body['access_token']);

    const playing = await spotifyApi.getMyCurrentPlayingTrack();

    let result;
    if (playing.body && playing.body.is_playing) {
      result = {
        isPlaying: true,
        item: playing.body.item,
        progress_ms: playing.body.progress_ms,
        timestamp: Date.now()
      };
    } else {
      result = { 
        isPlaying: false, 
        timestamp: Date.now() 
      };
    }

    // Cache the result
    spotifyCache = {
      data: result,
      timestamp: Date.now()
    };

    return result;
  } catch (error) {
    console.error('Error in now-playing API route:', error);
    const errorResult = { 
      isPlaying: false, 
      error: 'Error fetching data', 
      timestamp: Date.now() 
    };

    // Cache the error result for a shorter time
    spotifyCache = {
      data: errorResult,
      timestamp: Date.now() - (cacheTime - 5000) // Cache error for only 5 seconds
    };

    return errorResult;
  }
});