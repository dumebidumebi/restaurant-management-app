// lib/session.ts
import { v4 as uuidv4 } from 'uuid';

export const getOrCreateSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('sessionId', sessionId);
    document.cookie = `sessionId=${sessionId}; path=/; max-age=${604800}; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
  }
  return sessionId;
};