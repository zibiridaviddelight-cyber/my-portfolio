// assets/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form[action="portal.html"]');
    const signupForm = document.querySelector('form[action="portal.html"]'); // Assuming signup also goes to portal for now

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            // In a real app, you would verify credentials with a server here.
            // For now, we'll just get the email to personalize the dashboard.
            const email = document.getElementById('email').value;
            
            // We'll extract a name from the email (e.g., "john.doe@email.com" -> "John.doe")
            const name = email.split('@')[0];
            const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

            // Store the name in localStorage to be used on the portal page
            localStorage.setItem('clientName', capitalizedName);
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            const fullName = document.getElementById('fullname').value;

            if (fullName) {
                 // If the full name is provided on signup, use that
                 localStorage.setItem('clientName', fullName);
            } else {
                // Fallback for login form
                const email = document.getElementById('email').value;
                const name = email.split('@')[0];
                const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
                localStorage.setItem('clientName', capitalizedName);
            }
        });
    }
});
