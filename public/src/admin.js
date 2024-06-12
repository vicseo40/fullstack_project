// admin.js
document.addEventListener('DOMContentLoaded', () => {
    const usersTableBody = document.getElementById('usersTableBody');

    function loadUsers() {
        fetch('/api/users')
            .then(response => response.json())
            .then(users => {
                usersTableBody.innerHTML = '';
                users.forEach(user => {
                    const userRow = document.createElement('tr');
                    userRow.innerHTML = `
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>${user.firstName}</td>
                        <td>${user.lastName}</td>
                        <td>${user.isAdmin ? 'Yes' : 'No'}</td>
                        <td><button class="delete-button" data-id="${user._id}">Delete</button></td>
                    `;
                    usersTableBody.appendChild(userRow);
                });

                document.querySelectorAll('.delete-button').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const userId = e.target.getAttribute('data-id');
                        if (confirm('Are you sure you want to delete this user?')) {
                            fetch(`/api/users/${userId}`, {
                                method: 'DELETE'
                            })
                                .then(response => response.json())
                                .then(result => {
                                    if (result.message === 'User deleted successfully') {
                                        alert(result.message);
                                        loadUsers();
                                    } else {
                                        alert('Error deleting user');
                                    }
                                })
                                .catch(error => {
                                    console.error('Error deleting user:', error);
                                    alert('Error deleting user');
                                });
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });
    }

    loadUsers();
});
