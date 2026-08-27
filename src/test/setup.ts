import { afterEach } from 'vitest';

afterEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
  document.documentElement.className = '';
});