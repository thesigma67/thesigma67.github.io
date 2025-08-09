document.addEventListener('DOMContentLoaded', () => {
  const inputUrl = document.getElementById('url-input');
  const shortenBtn = document.getElementById('shorten-btn');
  const result = document.getElementById('result');
  const customAliasInput = document.getElementById('custom-alias');

  shortenBtn.addEventListener('click', async () => {
    const url = inputUrl.value.trim();
    const shorturl = customAliasInput.value.trim();

    if (!url) {
      alert('Please enter a URL to shorten.');
      return;
    }

    let apiUrl = `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`;
    if (shorturl) {
      apiUrl += `&shorturl=${encodeURIComponent(shorturl)}`;
    }

    result.textContent = 'Shortening...';

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.errorcode) {
        result.textContent = `Error: ${data.errormessage}`;
        return;
      }

      const shortUrl = data.shorturl;
      result.innerHTML = `Short URL: <a href="${shortUrl}" target="_blank" rel="noopener">${shortUrl}</a>`;

    } catch (error) {
      result.textContent = 'Error: Unable to shorten URL.';
      console.error(error);
    }
  });
});
