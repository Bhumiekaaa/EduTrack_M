document.addEventListener('DOMContentLoaded', function() {
    feather.replace();
    initializeRoleSelection();
    initializeCaptcha();
    initializePasswordValidation();
    initializeRememberMe();
});

// Role Selection
function initializeRoleSelection() {
    const tabs = document.querySelectorAll('.role-tab');
    const selectedRole = document.getElementById('selectedRole');
    const studentFields = document.getElementById('studentFields');
    const teacherFields = document.getElementById('teacherFields');
    const parentFields = document.getElementById('parentFields');

    function setRole(role) {
        selectedRole.value = role;
        
        // Show/hide fields
        studentFields.classList.toggle('hidden', role !== 'student');
        teacherFields.classList.toggle('hidden', role !== 'teacher');
        parentFields.classList.toggle('hidden', role !== 'parent');
        
        // Update tab styling
        tabs.forEach(t => {
            if (t.dataset.role === role) {
                t.classList.add('active');
                t.classList.remove('bg-white', 'text-gray-700');
                t.classList.add('bg-indigo-600', 'text-white');
            } else {
                t.classList.remove('active');
                t.classList.remove('bg-indigo-600', 'text-white');
                t.classList.add('bg-white', 'text-gray-700');
            }
        });
    }

    tabs.forEach(t => t.addEventListener('click', () => setRole(t.dataset.role)));
    setRole('student'); // Default
}

// Notification Functions
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    
    notification.className = `notification fixed top-4 right-4 max-w-sm p-4 rounded-lg shadow-lg z-50 notification-${type}`;
    notificationMessage.textContent = message;
    
    // Show notification
    notification.style.display = 'block';
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        closeNotification();
    }, 5000);
}

function closeNotification() {
    const notification = document.getElementById('notification');
    notification.classList.remove('show');
    setTimeout(() => {
        notification.style.display = 'none';
    }, 300);
}

// Form Submission
const form = document.getElementById('registerForm');
if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get reCAPTCHA response
        const recaptchaResponse = grecaptcha.getResponse();
        const recaptchaError = document.getElementById('recaptcha-error');
        
        // Show error if reCAPTCHA is not completed
        if (!recaptchaResponse || recaptchaResponse.length === 0) {
            if (recaptchaError) {
                recaptchaError.textContent = 'Please complete the reCAPTCHA verification';
                recaptchaError.classList.remove('hidden');
            }
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            return false;
        }

        // Get form data
        const formData = new FormData(form);
        const userData = {};
        
        // Add reCAPTCHA response to form data
        userData.captchaToken = recaptchaResponse;
        for (let [key, value] of formData.entries()) {
            if (key.includes('.')) {
                const [parent, child] = key.split('.');
                userData[parent] = userData[parent] || {};
                userData[parent][child] = value;
            } else {
                userData[key] = value;
            }
        }

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Creating Account...</span>';
            
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to register');
            }

            // Handle remember me
            const rememberCheckbox = document.getElementById('remember-me');
            if (rememberCheckbox && rememberCheckbox.checked) {
                localStorage.setItem('edu_remember_email', userData.email);
                localStorage.setItem('edu_remember_flag', '1');
            }

            // Show success notification
            showNotification('Account created successfully! Redirecting to dashboard...');

            // Redirect after delay to role-specific dashboard pages
            setTimeout(() => {
                const role = userData.role;
                if (role === 'teacher') {
                    window.location.href = 'teacher-dashboard.html';
                } else if (role === 'parent') {
                    window.location.href = 'parent-dashboard.html';
                } else {
                    window.location.href = 'student-dashboard.html';
                }
            }, 1200);

        } catch (error) {
            showNotification(error.message || 'Registration failed. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Create Account</span>';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

// Math Captcha
function initializeCaptcha() {
    function generateMath() {
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 8) + 2;
        return { question: `${a} + ${b} = ?`, answer: a + b };
    }

    let currentAnswer = null;
    const mathQuestion = document.getElementById('mathQuestion');
    const mathAnswer = document.getElementById('mathAnswer');
    const mathError = document.getElementById('mathError');
    const regenButton = document.getElementById('regenCaptcha');

    function renderMath() {
        const math = generateMath();
        currentAnswer = math.answer;
        if (mathQuestion) mathQuestion.textContent = math.question;
        if (mathAnswer) mathAnswer.value = '';
        if (mathError) mathError.classList.add('hidden');
    }

    renderMath();
    if (regenButton) regenButton.addEventListener('click', renderMath);
}

// Password Validation
function initializePasswordValidation() {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    if (confirmPassword) {
        confirmPassword.addEventListener('input', function() {
            if (password && this.value !== password.value) {
                this.setCustomValidity('Passwords do not match');
            } else {
                this.setCustomValidity('');
            }
        });
    }
}

// Remember Me
function initializeRememberMe() {
    const storedEmail = localStorage.getItem('edu_remember_email');
    const rememberFlag = localStorage.getItem('edu_remember_flag');
    
    if (storedEmail) {
        const emailField = document.getElementById('email');
        if (emailField) emailField.value = storedEmail;
    }
    
    if (rememberFlag === '1') {
        const checkbox = document.getElementById('remember-me');
        if (checkbox) checkbox.checked = true;
    }
}