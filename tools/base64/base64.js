document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const encodeBtn = document.getElementById('encode');
  const decodeBtn = document.getElementById('decode');
  const removeNonAlphaCheckbox = document.getElementById('remove-nonalpha');
  const strictModeCheckbox = document.getElementById('strict-mode');
  const languageSelect = document.getElementById('language');

  const alphabets = {
    standard: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', // Standard RFC 4648
    urlsafe: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_', // URL Safe RFC 4648
    bcrypt: './ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', // bcrypt variant
    custom: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*-' // your custom example
  };

  // Remove any characters not in the alphabet or padding (=)
  function cleanInput(str, alphabet) {
    if (removeNonAlphaCheckbox.checked) {
      const allowed = alphabet + '=';
      // Escape special regex chars in allowed string
      const escapedAllowed = allowed.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
      const regex = new RegExp(`[^${escapedAllowed}]`, 'g');
      return str.replace(regex, '');
    }
    return str;
  }

  // UTF-8 encode string to base64
  function utf8ToBase64(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
  }

  // Decode base64 to UTF-8 string
  function base64ToUtf8(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  }

  // Encode input string to base64 with selected alphabet
  function encodeBase64(str, alphabet) {
    const base64 = utf8ToBase64(str);

    // If standard alphabet selected, no translation needed
    if (alphabet === alphabets.standard) return base64;

    // Translate base64 chars to custom alphabet
    let result = '';
    for (let i = 0; i < base64.length; i++) {
      const c = base64[i];
      const idx = alphabets.standard.indexOf(c);
      if (idx === -1) {
        result += c; // probably padding '=' or unknown char
      } else {
        result += alphabet[idx];
      }
    }
    return result;
  }

  // Decode base64 string with selected alphabet to original string
  function decodeBase64(str, alphabet) {
    let cleaned = cleanInput(str, alphabet);

    // Translate to standard base64 if needed
    if (alphabet !== alphabets.standard) {
      const regex = new RegExp(`[${alphabet}]`, 'g');
      cleaned = cleaned.replace(regex, c => {
        const idx = alphabet.indexOf(c);
        return idx === -1 ? c : alphabets.standard[idx];
      });
    }

    // Add padding if strict mode enabled
    if (strictModeCheckbox.checked) {
      while (cleaned.length % 4 !== 0) {
        cleaned += '=';
      }
    }

    try {
      return base64ToUtf8(cleaned);
    } catch {
      return 'Error: Invalid Base64 input or decoding failed.';
    }
  }

  encodeBtn.addEventListener('click', () => {
    const selectedAlphabet = alphabets[languageSelect.value] || alphabets.standard;
    output.value = encodeBase64(input.value, selectedAlphabet);
  });

  decodeBtn.addEventListener('click', () => {
    const selectedAlphabet = alphabets[languageSelect.value] || alphabets.standard;
    output.value = decodeBase64(input.value, selectedAlphabet);
  });
});
