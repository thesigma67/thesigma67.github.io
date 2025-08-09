function generatePassword(options) {
  let chars = "abcdefghijklmnopqrstuvwxyz";
  if (options.includeUppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (options.includeNumbers) chars += "0123456789";
  if (options.includeSymbols) chars += "!@#$%^&*()-_=+[]{}|;:',.<>/?";

  if (chars.length === 0) return "";

  let pwd = "";
  for (let i = 0; i < options.length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("password");
  const toggleImg = document.getElementById("toggleVisibility");
  const generateBtn = document.getElementById("generate");
  const copyBtn = document.getElementById("copy");
  const clearBtn = document.getElementById("clear");

  const lengthInput = document.getElementById("length");
  const uppercaseCheckbox = document.getElementById("includeUppercase");
  const numbersCheckbox = document.getElementById("includeNumbers");
  const symbolsCheckbox = document.getElementById("includeSymbols");

  let passwordVisible = false;

  generateBtn.addEventListener("click", () => {
    const length = Number(lengthInput.value);
    if (length < 4 || length > 64) {
      alert("Password length must be between 4 and 64.");
      return;
    }

    const options = {
      length,
      includeUppercase: uppercaseCheckbox.checked,
      includeNumbers: numbersCheckbox.checked,
      includeSymbols: symbolsCheckbox.checked,
    };

    const pwd = generatePassword(options);
    if (!pwd) {
      alert("Please select at least one character type.");
      return;
    }

    passwordInput.setAttribute("data-password", pwd);
    passwordInput.value = "•".repeat(pwd.length);
    passwordVisible = false;
  });

  toggleImg.addEventListener("click", () => {
    const actualPwd = passwordInput.getAttribute("data-password");
    if (!actualPwd) return;

    passwordVisible = !passwordVisible;
    passwordInput.value = passwordVisible ? actualPwd : "•".repeat(actualPwd.length);
  });

  copyBtn.addEventListener("click", () => {
    const actualPwd = passwordInput.getAttribute("data-password");
    if (!actualPwd) {
      alert("Generate a password first!");
      return;
    }
    navigator.clipboard.writeText(actualPwd)
      .then(() => alert("Password copied to clipboard!"))
      .catch(() => alert("Failed to copy password."));
  });

  clearBtn.addEventListener("click", () => {
    passwordInput.value = "";
    passwordInput.removeAttribute("data-password");
    passwordVisible = false;
  });
});
