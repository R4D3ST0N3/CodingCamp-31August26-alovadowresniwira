'use strict';

const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('budgetAppState');
let theme = 'light';

if (savedTheme) {
  try {
    theme = JSON.parse(savedTheme).theme || 'light';
  } catch {
    theme = 'light';
  }
}

function applyTheme(nextTheme) {
  document.documentElement.setAttribute('data-theme', nextTheme);
  themeToggle.textContent = nextTheme === 'dark' ? 'LIGHT' : 'DARK';
  themeToggle.setAttribute('aria-label', nextTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  theme = nextTheme;
}

themeToggle.addEventListener('click', () => {
  applyTheme(theme === 'light' ? 'dark' : 'light');
});

applyTheme(theme);
