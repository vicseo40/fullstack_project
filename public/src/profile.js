document.addEventListener('DOMContentLoaded', function() {
    const usernameElement = document.querySelector('.username');
    const fullnameElement = document.querySelector('.fullname');
    const emailElement = document.querySelector('.email');
    const logoutButton = document.getElementById('logout-button');

    function loadProfile() {
        fetch('/api/users/profile')
            .then(response => response.json())
            .then(user => {
                usernameElement.textContent = user.username;
                fullnameElement.textContent = `${user.firstName} ${user.lastName}`;
                emailElement.textContent = user.email;
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

    loadProfile();
});

// profile.js
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/auth/status')
        .then(response => response.json())
        .then(data => {
            if (data.isAuthenticated) {
                if (data.isAdmin) {
                    document.getElementById('adminPageButton').style.display = 'block';
                }
            } else {
                window.location.href = 'login.html';
            }
        })
        .catch(error => console.error('Error fetching auth status:', error));

    document.getElementById('logoutButton').addEventListener('click', () => {
        fetch('/api/users/logout')
            .then(() => {
                window.location.href = 'login.html';
            })
            .catch(error => console.error('Error logging out:', error));
    });
});

