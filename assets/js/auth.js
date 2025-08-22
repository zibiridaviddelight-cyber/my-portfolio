document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const errorMessageDiv = document.getElementById('error-message');
    const successMessageDiv = document.getElementById('success-message'); // For signup success

    const displayError = (message) => {
        if (errorMessageDiv) {
            errorMessageDiv.textContent = message;
            errorMessageDiv.classList.remove('hidden');
        }
    };
    
    const displaySuccess = (message) => {
        if (successMessageDiv) {
            successMessageDiv.textContent = message;
            successMessageDiv.classList.remove('hidden');
        }
    };

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if(errorMessageDiv) errorMessageDiv.classList.add('hidden');

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/.netlify/functions/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Login failed.');
                }

                // Store user's name and redirect to portal
                localStorage.setItem('clientName', data.fullName);
                window.location.href = 'portal.html';

            } catch (error) {
                displayError(error.message);
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if(errorMessageDiv) errorMessageDiv.classList.add('hidden');
            if(successMessageDiv) successMessageDiv.classList.add('hidden');

            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/.netlify/functions/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullname, email, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Signup failed.');
                }
                
                // On successful signup, redirect to the "please verify" page
                window.location.href = 'please-verify.html';

            } catch (error) {
                displayError(error.message);
            }
        });
    }
});