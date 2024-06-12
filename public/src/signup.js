document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const errorMessage = document.getElementById('error-message');
  const successMessage = document.getElementById('success-message');

  if (password !== confirmPassword) {
    errorMessage.style.display = 'block';
    errorMessage.textContent = 'Passwords do not match';
    successMessage.style.display = 'none';
    return;
  }

  try {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ firstName, lastName, username, email, password })
    });

    const data = await response.json();

    if (data.error) {
      errorMessage.style.display = 'block';
      errorMessage.textContent = data.error;
      successMessage.style.display = 'none';
    } else {
      successMessage.style.display = 'block';
      successMessage.textContent = 'Registration successful! Redirecting to login...';
      errorMessage.style.display = 'none';
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    }
  } catch (error) {
    console.error('Error:', error);
    errorMessage.style.display = 'block';
    errorMessage.textContent = 'An error occurred. Please try again.';
    successMessage.style.display = 'none';
  }
});
