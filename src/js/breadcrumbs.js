const crumbs = document.getElementById('breadcrumbs');
crumbs.innerHTML = '';

const path = window.location.pathname.replace(/\/$/, "").split('/').filter(Boolean);

if (path.length === 0) {
  const homeLi = document.createElement('li');
  homeLi.textContent = 'Home';
  crumbs.appendChild(homeLi);

  const dummyLi = document.createElement('li');
  dummyLi.textContent = '\u00A0';
  crumbs.appendChild(dummyLi);
} else {
  const homeLi = document.createElement('li');
  homeLi.innerHTML = `<a href="/">Home</a>`;
  crumbs.appendChild(homeLi);

  let currentPath = '/';

  path.forEach((segment, index) => {
    currentPath += segment + '/';
    const li = document.createElement('li');

    const formatted = decodeURIComponent(segment)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    if (index === path.length - 1) {
      li.textContent = formatted; 
    } else {
      li.innerHTML = `<a href="${currentPath}">${formatted}</a>`;
    }

    crumbs.appendChild(li);
  });
}
