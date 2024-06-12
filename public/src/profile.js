document.addEventListener('DOMContentLoaded', () => {
    const usernameElement = document.querySelector('.username');
    const fullnameElement = document.querySelector('.fullname');
    const emailElement = document.querySelector('.email');
    const logoutButton = document.getElementById('logoutButton');
    const adminNavItem = document.querySelector('nav ul li a[href="admin.html"]').parentElement;

    function loadProfile() {
        fetch('/api/users/profile')
            .then(response => response.json())
            .then(user => {
                usernameElement.textContent = user.username;
                fullnameElement.textContent = `${user.firstName} ${user.lastName}`;
                emailElement.textContent = user.email;

                // Check if user is admin and display admin nav item
                if (user.isAdmin) {
                    adminNavItem.style.display = 'block';
                } else {
                    adminNavItem.style.display = 'none';
                }
            })
            .catch(error => console.error('Error fetching profile:', error));
    }

    function logout() {
        fetch('/api/users/logout')
            .then(response => {
                if (response.ok) {
                    window.location.href = 'login.html';
                } else {
                    console.error('Logout failed');
                }
            })
            .catch(error => console.error('Error during logout:', error));
    }

    logoutButton.addEventListener('click', logout);

    fetch('/api/auth/status')
        .then(response => response.json())
        .then(data => {
            if (!data.isAuthenticated) {
                window.location.href = 'login.html';
            }
        })
        .catch(error => console.error('Error fetching auth status:', error));

    loadProfile();
});
