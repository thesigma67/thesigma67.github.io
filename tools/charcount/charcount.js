document.addEventListener('DOMContentLoaded', () => {
  const textInput = document.getElementById('textInput');
  const limitMode = document.getElementById('limitMode');
  const limitInput = document.getElementById('limitInput');
  const heading = document.querySelector('.main-container h2');
  const paragraphType = document.getElementById('paragraphType');

  function updateCounts() {
    const text = textInput.value;

    const characters = text.length;
    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    const words = (text.trim().match(/\b\S+\b/g) || []).length;
    const sentences = (text.match(/[.!?](\s|$)/g) || []).length;

    let paragraphs = 0;
    if (text.trim()) {
      if (paragraphType.value === 'newline') {
        paragraphs = text.split(/\n/).filter(p => p.trim().length > 0).length;
      } else if (paragraphType.value === 'othernewline') {
        paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
      }
    }

    heading.textContent = `${characters} characters, ${letters} letters, ${words} words, ${sentences} sentences, ${paragraphs} paragraphs`;

    // Optional: Warn if over limit but don’t trim yet
    if (limitMode.checked && limitInput.value) {
      if (characters > Number(limitInput.value)) {
        heading.style.color = 'red';
      } else {
        heading.style.color = '';
      }
    } else {
      heading.style.color = '';
    }
  }

  function applyLimit() {
    if (limitMode.checked) {
      const limit = parseInt(limitInput.value, 10);
      if (!isNaN(limit) && textInput.value.length > limit) {
        textInput.value = textInput.value.slice(0, limit);
      }
    }
    updateCounts();
  }

  // Live update counts on input (no trimming)
  textInput.addEventListener('input', updateCounts);

  // Apply limit on Enter key
  textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      applyLimit();
    }
  });

  // Apply limit on blur (unfocus)
  textInput.addEventListener('blur', applyLimit);

  // Update counts when toggling limit mode or changing limit or paragraph type
  limitMode.addEventListener('change', updateCounts);
  limitInput.addEventListener('input', updateCounts);
  paragraphType.addEventListener('change', updateCounts);

  updateCounts();
});
