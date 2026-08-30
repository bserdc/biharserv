document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('.main-nav');
  const toggle = document.querySelector('.menu-toggle');
  if (menu && toggle) toggle.addEventListener('click', () => { const open = menu.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); });
  document.querySelectorAll('[data-current-year]').forEach(node => node.textContent = new Date().getFullYear());
});
