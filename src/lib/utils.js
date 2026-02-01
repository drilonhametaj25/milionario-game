import { clsx } from 'clsx';

export function cn(...inputs) {
  return clsx(inputs);
}

export function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((resolve, reject) => {
      document.execCommand('copy') ? resolve() : reject();
      textArea.remove();
    });
  }
}

export function formatRoomCode(code) {
  if (!code) return '';
  return code.toUpperCase();
}

export function generateShareUrl(roomCode) {
  const baseUrl = window.location.origin;
  return `${baseUrl}/join/${roomCode}`;
}

export function getStoredSession() {
  try {
    const playerId = localStorage.getItem('playerId');
    const roomCode = localStorage.getItem('roomCode');
    return { playerId, roomCode };
  } catch {
    return { playerId: null, roomCode: null };
  }
}

export function setStoredSession(playerId, roomCode) {
  try {
    if (playerId) localStorage.setItem('playerId', playerId);
    if (roomCode) localStorage.setItem('roomCode', roomCode);
  } catch {
    console.warn('Failed to save session to localStorage');
  }
}

export function clearStoredSession() {
  try {
    localStorage.removeItem('playerId');
    localStorage.removeItem('roomCode');
  } catch {
    console.warn('Failed to clear session from localStorage');
  }
}

export const AVATAR_EMOJIS = [
  '😀', '😎', '🤠', '🥳', '😈', '👻', '🤖', '👽',
  '🦊', '🐱', '🐶', '🦁', '🐯', '🐻', '🐼', '🐨',
  '🦄', '🐲', '🦋', '🌟', '🔥', '💎', '🎭', '🎪',
  '🎯', '🎲', '🎸', '🎺', '🎨', '🏆', '👑', '💰'
];

export function getRandomEmoji() {
  return AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)];
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function formatPercentage(value, total) {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export function sortByScore(players, scores) {
  return [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
}

export function getMedalEmoji(position) {
  switch (position) {
    case 0: return '🥇';
    case 1: return '🥈';
    case 2: return '🥉';
    default: return '';
  }
}
