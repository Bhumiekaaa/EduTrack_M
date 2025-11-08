document.addEventListener('DOMContentLoaded', function() {
    feather.replace();
    initializeRoleSelection();
    initializeForm();
});

function initializeRoleSelection() {
    const roleTabs = document.querySelectorAll('.role-tab');
    const selectedRoleInput = document.getElementById('selected-role');

    roleTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            roleTabs.forEach(t => {
                t.classList.remove('active', 'bg-indigo-600', 'text-white');
                t.classList.add('bg-white', 'text-gray-700');
            });
            
            // Add active class to clicked tab
            this.classList.add('active', 'bg-indigo-600', 'text-white');
            this.classList.remove('bg-white', 'text-gray-700');
            
            // Update hidden input value
            selectedRoleInput.value = this.dataset.role;
        });
    });
}

function initializeForm() {
    const form = document.getElementById('loginForm');
    const submitBtn = document.getElementById('loginBtn');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('selected-role').value;
        const rememberMe = document.getElementById('remember-me').checked;
        const formMessage = document.getElementById('formMessage');

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i data-feather="loader" class="animate-spin mr-2 h-4 w-4"></i> Signing in...';
            feather.replace();
            formMessage.classList.add('hidden');

            // Store credentials if remember me is checked
            if (rememberMe) {
                localStorage.setItem('edutrack_email', email);
                localStorage.setItem('edutrack_role', role);
            } else {
                localStorage.removeItem('edutrack_email');
                localStorage.removeItem('edutrack_role');
            }

            // For demonstration, we'll simulate a successful login
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Store user info in localStorage
            localStorage.setItem('user', JSON.stringify({
                email: email,
                role: role,
                isLoggedIn: true
            }));

            // Show success message
            formMessage.textContent = 'Login successful! Redirecting...';
            formMessage.classList.remove('hidden', 'text-red-600');
            formMessage.classList.add('text-green-600');

            // Store user data in session storage for the dashboard
            const userData = {
                email: email,
                name: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                role: role,
                isLoggedIn: true
            };
            sessionStorage.setItem('userData', JSON.stringify(userData));
            
            // If remember me is checked, store in localStorage as well
            if (rememberMe) {
                localStorage.setItem('userData', JSON.stringify(userData));
            }

            // Redirect to role-specific dashboard pages
            setTimeout(() => {
                if (role === 'teacher') {
                    window.location.href = 'teacher-dashboard.html';
                } else if (role === 'parent') {
                    window.location.href = 'parent-dashboard.html';
                } else {
                    // default to student dashboard
                    window.location.href = 'student-dashboard.html';
                }
            }, 800);

        } catch (error) {
            formMessage.textContent = error.message || 'Login failed. Please try again.';
            formMessage.classList.remove('hidden', 'text-green-600');
            formMessage.classList.add('text-red-600');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Sign in';
            feather.replace();
        }
    });

    // Check for remembered credentials
    const rememberedEmail = localStorage.getItem('edutrack_email');
    const rememberedRole = localStorage.getItem('edutrack_role');
    
    if (rememberedEmail && rememberedRole) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('selected-role').value = rememberedRole;
        document.getElementById('remember-me').checked = true;
        
        // Update role tabs
        const roleTab = document.querySelector(`[data-role="${rememberedRole}"]`);
        if (roleTab) {
            roleTab.click();
        }
    }
}