import { CAPYBARA_AVATARS } from './avatars';

/**
 * Asset preloading for performance optimization
 * Preloads game assets while in lobby to improve loading times
 */
export const preloadGameAssets = () => {
  // Preload background image for game page
  const gameBackground = new Image();
  gameBackground.src = '/images/capybara_background_multiple.png';
  
  // Preload all capybara avatars
  CAPYBARA_AVATARS.forEach(avatar => {
    const img = new Image();
    img.src = `/images/${avatar.file}`;
  });
  
  // Preload progress bar icon
  const progressIcon = new Image();
  progressIcon.src = '/images/Capy-progress-bar-icon.svg';
  
  // Preload any other game-specific assets
  const viteIcon = new Image();
  viteIcon.src = '/vite.svg';
};
