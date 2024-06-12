// password_change.js
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/auth/status')
        .then(response => response.json())
        .then(data => {
            if (!data.isAuthenticated) {
                window.location.href = 'login.html';
            }
        })
        .catch(error => console.error('Error fetching auth status:', error));

    const passwordChangeForm = document.getElementById('passwordChangeForm');
    passwordChangeForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (newPassword !== confirmNewPassword) {
            alert('New password and confirm password do not match');
            return;
        }

        try {
            const response = await fetch('/api/users/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });

            const result = await response.json();
            if (response.ok) {
                alert('Password changed successfully');
                window.location.href = 'profile.html';
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error changing password:', error);
            alert('Error changing password');
        }
    });
});
