// Capybara avatar list and utility for lookup by file name
export const CAPYBARA_AVATARS = [
  { file: 'Capy-face-green.png', color: '#6ee7b7', name: 'green' },
  { file: 'Capy-face-blue.png', color: '#60a5fa', name: 'blue' },
  { file: 'Capy-face-yellow.png', color: '#fde68a', name: 'yellow' },
  { file: 'Capy-face-pink.png', color: '#f9a8d4', name: 'pink' },
  { file: 'Capy-face-brown.png', color: '#bfa181', name: 'brown' },
  { file: 'Capy-face-orange.png', color: '#fdba74', name: 'orange' },
  { file: 'Capy-face-white.png', color: '#fff', name: 'white' },
  { file: 'Capy-face-red.png', color: '#f87171', name: 'red' },
  { file: 'Capy-face-purple.png', color: '#a78bfa', name: 'purple' },
  { file: 'Capy-face-black.png', color: '#232323', name: 'black' },
];

export function getAvatarByFile(file: string) {
  return CAPYBARA_AVATARS.find(a => a.file === file) || CAPYBARA_AVATARS[0];
}
