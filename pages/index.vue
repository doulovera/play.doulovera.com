<template>
  <div id="now-playing-container">
    <div class="header">
      <svg class="spotify-logo" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.66 0-.479.359-.66.66-.84 4.621-1.021 8.521-.6 11.64 1.32.42.18.479.659.122 1.081zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.32 11.28-1.08 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" fill="#1DB954"/>
      </svg>
      <h1>Douglas is <span v-if="isPlaying">now playing</span></h1>
    </div>
    <div id="spotify-info">
      <p v-if="!isPlaying">Currently not listening</p>
      <div v-else-if="song">
        <h2>{{ song.name }}</h2>
        <p>{{ song.artists.map(artist => artist.name).join(', ') }}</p>
        <img :src="song.album.images[0].url" alt="Album Art" width="300">
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch, ref } from 'vue';

// --- Add your background image URLs here ---
const fallbackImages = [
  'https://i.scdn.co/image/ab67616d0000b273a408c78e231f716383a58eb3',
  'https://i.scdn.co/image/ab67616d0000b273ef51817e6a6563b6f7ce5872'
];

// Fetch data on the server for the initial load, and on the client for hydration.
const { data: nowPlaying, refresh, pending } = await useFetch('/api/now-playing', {
  server: true, // Enable server-side rendering
  client: true, // Also fetch on client
  default: () => ({ isPlaying: false })
});

// Reactive state
const isPlaying = computed(() => nowPlaying.value?.isPlaying ?? false);
const song = computed(() => nowPlaying.value?.item ?? null);

// Watch for changes in the song data to update the background and progress
watch(song, (newSong, oldSong) => {
  if (process.client) {
    // Update background image
    if (newSong && newSong.album.images[0].url) {
      document.documentElement.style.setProperty('--background-image-url', `url(${newSong.album.images[0].url})`);
    } else {
      if (fallbackImages.length > 0) {
        const randomImage = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
        document.documentElement.style.setProperty('--background-image-url', `url(${randomImage})`);
        document.documentElement.style.setProperty('-webkit-filter', 'grayscale(100%)');
        document.documentElement.style.setProperty('filter', 'gray');
      } else {
        document.documentElement.style.setProperty('--background-image-url', 'none');
        document.documentElement.style.setProperty('-webkit-filter', 'grayscale(0%)');
        document.documentElement.style.setProperty('filter', 'none');
      }
    }

    // Initialize progress when song changes
    if (newSong?.id !== oldSong?.id) {
      // Song changed, no additional action needed
    }
  }
}, { immediate: true });

// Timers
let refreshIntervalId = null;

// onMounted runs only on the client. Perfect for setting up timers.
onMounted(() => {
  // Main polling timer to re-sync with Spotify - reduced frequency
  refreshIntervalId = setInterval(() => {
    if (!pending.value) { // Only refresh if not already pending
      refresh();
    }
  }, 60000); // 1 minute
});

// Clean up the intervals when the component is unmounted
onUnmounted(() => {
  if (refreshIntervalId) clearInterval(refreshIntervalId);
});
</script>

<style>
:root {
  /* CSS variable to hold the background image URL */
  --background-image-url: none;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: #121212; /* Fallback color */
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    overflow: hidden;
}

/* Pseudo-element for the blurred background */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;

  background-image: var(--background-image-url);
  background-position: center;
  background-size: cover;

  /* The magic: heavy blur, darken, and scale to avoid edge artifacts */
  filter: blur(40px) brightness(0.5);
  transform: scale(1.1);

  /* Smooth transition between album covers */
  transition: background-image 0.7s ease-in-out;
}

#now-playing-container {
    text-align: center;
    background: rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(15px) saturate(150%);
    -webkit-backdrop-filter: blur(15px) saturate(150%);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 40px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 20px;
}

.spotify-logo {
    flex-shrink: 0;
    opacity: 0.9;
    transition: opacity 0.3s ease;
}

.spotify-logo:hover {
    opacity: 1;
}

#spotify-info {
    min-height: 350px; /* Ensure container doesn't jump in size */
    min-width: 425px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

#spotify-info img {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

h1 {
    font-weight: 600;
    letter-spacing: 1px;
}

h2 {
    font-weight: 500;
    margin-bottom: 0.5rem;
}

p {
    color: #ccc;
}
</style>