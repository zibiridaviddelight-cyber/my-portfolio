document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('admin-login-form');
    const clientsTableBody = document.getElementById('clients-table-body');
    const errorMessageDiv = document.getElementById('error-message');
    const adminLogoutBtn = document.getElementById('admin-logout');

    const displayError = (message) => {
        if (errorMessageDiv) {
            errorMessageDiv.textContent = message;
            errorMessageDiv.classList.remove('hidden');
        }
    };

    // --- Admin Login Logic ---
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if(errorMessageDiv) errorMessageDiv.classList.add('hidden');

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/.netlify/functions/admin-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Login failed.');
                }
                
                // For simplicity, we'll use localStorage to track admin session
                localStorage.setItem('isAdminLoggedIn', 'true');
                window.location.href = 'admin-dashboard.html';

            } catch (error) {
                displayError(error.message);
            }
        });
    }

    // --- Admin Dashboard Logic ---
    if (clientsTableBody) {
        // Basic security check
        if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
            // window.location.href = 'admin-login.html';
            // return; // Stop execution if not logged in
        }

        const fetchClients = async () => {
            try {
                const response = await fetch('/.netlify/functions/get-clients');
                if (!response.ok) throw new Error('Could not fetch clients.');
                
                const clients = await response.json();
                clientsTableBody.innerHTML = ''; // Clear any placeholder

                if (clients.length === 0) {
                    clientsTableBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-400">No clients have registered yet.</td></tr>';
                    return;
                }

                clients.forEach(client => {
                    const joinedDate = new Date(client.created_at).toLocaleDateString();
                    const verifiedStatus = client.is_verified 
                        ? '<span class="bg-green-500/20 text-green-400 text-xs font-semibold px-2 py-1 rounded-full">Yes</span>'
                        : '<span class="bg-yellow-500/20 text-yellow-400 text-xs font-semibold px-2 py-1 rounded-full">No</span>';

                    const row = `
                        <tr class="border-b border-gray-700 hover:bg-gray-700/50">
                            <td class="p-4">${client.full_name}</td>
                            <td class="p-4">${client.email}</td>
                            <td class="p-4">${verifiedStatus}</td>
                            <td class="p-4 text-gray-400">${joinedDate}</td>
                        </tr>
                    `;
                    clientsTableBody.insertAdjacentHTML('beforeend', row);
                });

            } catch (error) {
                clientsTableBody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-red-400">${error.message}</td></tr>`;
            }
        };

        fetchClients();
    }
    
    // --- Admin Logout Logic ---
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isAdminLoggedIn');
            window.location.href = 'admin-login.html';
        });
    }
});
