// DOM Elements
const passwordInput = document.getElementById('password-input');
const toggleVisibility = document.getElementById('toggle-visibility');
const strengthMeter = document.getElementById('strength-meter');
const strengthText = document.getElementById('strength-text');
const passwordFeedback = document.getElementById('password-feedback');
const generatedPassword = document.getElementById('generated-password');
const lowercaseCheckbox = document.getElementById('lowercase');
const uppercaseCheckbox = document.getElementById('uppercase');
const numbersCheckbox = document.getElementById('numbers');
const symbolsCheckbox = document.getElementById('symbols');
const lengthSlider = document.getElementById('length');
const lengthValue = document.getElementById('length-value');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const darkModeToggle = document.querySelector('.dark-mode-toggle');
const copyNotification = document.getElementById('copy-notification');
const body = document.body;

// Character sets
const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numberChars = '0123456789';
const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Initialize
lengthValue.textContent = lengthSlider.value;
updatePasswordStrength('');

// Event Listeners
passwordInput.addEventListener('input', (e) => {
    const password = e.target.value;
    updatePasswordStrength(password);
});

toggleVisibility.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    toggleVisibility.innerHTML = isPassword ? 
        `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>` :
        `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>`;
});

lengthSlider.addEventListener('input', (e) => {
    lengthValue.textContent = e.target.value;
});

generateBtn.addEventListener('click', generatePassword);
copyBtn.addEventListener('click', copyToClipboard);
darkModeToggle.addEventListener('click', toggleDarkMode);

// Functions
function updatePasswordStrength(password) {
    const strength = calculatePasswordStrength(password);
    
    // Update meter and text
    strengthMeter.style.width = strength.score * 25 + '%';
    
    switch(strength.score) {
        case 0:
        case 1:
            strengthMeter.style.backgroundColor = 'var(--danger-color)';
            strengthText.textContent = 'Lemah (Mudah Dibobol)';
            strengthText.style.color = 'var(--danger-color)';
            break;
        case 2:
            strengthMeter.style.backgroundColor = 'var(--warning-color)';
            strengthText.textContent = 'Baik (Tapi Masih Bisa Dibobol)';
            strengthText.style.color = 'var(--warning-color)';
            break;
        case 3:
            strengthMeter.style.backgroundColor = '#9bc53d';
            strengthText.textContent = 'Cukup Kuat';
            strengthText.style.color = '#9bc53d';
            break;
        case 4:
            strengthMeter.style.backgroundColor = 'var(--success-color)';
            strengthText.textContent = 'Sangat Kuat! (Sangat Sulit Untuk Dibobol)';
            strengthText.style.color = 'var(--success-color)';
            break;
    }
    
    // Provide feedback
    let feedback = '';
    if (password.length === 0) {
        feedback = '';
        passwordFeedback.style.display = 'none';
    } else {
        passwordFeedback.style.display = 'block';
        if (password.length < 8) {
            feedback = '⚠️ Kata sandi terlalu pendek. Gunakan minimal 8 karakter.';
            passwordFeedback.style.backgroundColor = 'rgba(239, 35, 60, 0.1)';
            passwordFeedback.style.color = 'var(--danger-color)';
        } else if (!strength.hasLowercase) {
            feedback = '💡 Tambahkan huruf kecil untuk memperkuat kata sandi Anda.';
            passwordFeedback.style.backgroundColor = 'rgba(255, 209, 102, 0.1)';
            passwordFeedback.style.color = 'var(--warning-color)';
        } else if (!strength.hasUppercase) {
            feedback = '💡 Tambahkan huruf kapital untuk memperkuat kata sandi Anda.';
            passwordFeedback.style.backgroundColor = 'rgba(255, 209, 102, 0.1)';
            passwordFeedback.style.color = 'var(--warning-color)';
        } else if (!strength.hasNumbers) {
            feedback = '💡 Tambahkan angka untuk memperkuat kata sandi Anda.';
            passwordFeedback.style.backgroundColor = 'rgba(255, 209, 102, 0.1)';
            passwordFeedback.style.color = 'var(--warning-color)';
        } else if (!strength.hasSymbols) {
            feedback = '💡 Tambahkan simbol untuk memperkuat kata sandi Anda.';
            passwordFeedback.style.backgroundColor = 'rgba(255, 209, 102, 0.1)';
            passwordFeedback.style.color = 'var(--warning-color)';
        } else if (strength.score === 4) {
            feedback = '✅ Luar biasa! Ini adalah kata sandi yang kuat.';
            passwordFeedback.style.backgroundColor = 'rgba(6, 214, 160, 0.1)';
            passwordFeedback.style.color = 'var(--success-color)';
        }
    }
    
    passwordFeedback.textContent = feedback;
}

function calculatePasswordStrength(password) {
    let score = 0;
    let hasLowercase = false;
    let hasUppercase = false;
    let hasNumbers = false;
    let hasSymbols = false;
    
    // Check length
    if (password.length === 0) {
        return { score: 0, hasLowercase, hasUppercase, hasNumbers, hasSymbols };
    }
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Check character types
    if (/[a-z]/.test(password)) {
        hasLowercase = true;
        score++;
    }
    
    if (/[A-Z]/.test(password)) {
        hasUppercase = true;
        score++;
    }
    
    if (/[0-9]/.test(password)) {
        hasNumbers = true;
        score++;
    }
    
    if (/[^a-zA-Z0-9]/.test(password)) {
        hasSymbols = true;
        score++;
    }
    
    // Cap score at 4
    score = Math.min(4, score);
    
    return { score, hasLowercase, hasUppercase, hasNumbers, hasSymbols };
}

function generatePassword() {
    let chars = '';
    let password = '';
    
    // Build character set based on selected options
    if (lowercaseCheckbox.checked) chars += lowercaseChars;
    if (uppercaseCheckbox.checked) chars += uppercaseChars;
    if (numbersCheckbox.checked) chars += numberChars;
    if (symbolsCheckbox.checked) chars += symbolChars;
    
    // Ensure at least one option is selected
    if (chars.length === 0) {
        alert('Harap pilih setidaknya satu jenis karakter.');
        return;
    }
    
    // Generate password
    const length = parseInt(lengthSlider.value);
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    
    // Display password
    generatedPassword.value = password;
    
    // Animate the generated password field
    generatedPassword.classList.add('pulse');
    setTimeout(() => {
        generatedPassword.classList.remove('pulse');
    }, 500);
    
    // Update strength meter for the generated password
    updatePasswordStrength(password);
}

function copyToClipboard() {
    if (!generatedPassword.value) {
        alert('No password to copy. Generate a password first.');
        return;
    }
    
    navigator.clipboard.writeText(generatedPassword.value)
        .then(() => {
            // Show notification
            copyNotification.classList.add('show');
            setTimeout(() => {
                copyNotification.classList.remove('show');
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy password to clipboard.');
        });
}

function toggleDarkMode() {
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    // Update button icon
    darkModeToggle.textContent = isDarkMode ? '🌞' : '🌓';
}

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    body.classList.add('dark-mode');
    darkModeToggle.textContent = '🌞';
}

// Generate initial password
generatePassword();