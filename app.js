// Get references to elements
const form = document.getElementById('auth-form');
const formTitle = document.getElementById('form-title');
const passwordConfirmationContainer = document.getElementById('password-confirmation-container');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');
const toggleText = document.getElementById('toggle-text');
const passwordInput = document.getElementById('password');
const passwordConfirmationInput = document.getElementById('password-confirmation');
const usernameInput = document.getElementById('username');

// Toggle between Sign Up and Sign In
let isSignIn = false;

toggleText.addEventListener('click', function() {
    isSignIn = !isSignIn;
    if (isSignIn) {
        formTitle.textContent = 'Sign In';
        passwordConfirmationContainer.style.display = 'none';  // Hide the password confirmation field
        passwordConfirmationInput.removeAttribute('required');  // Remove the 'required' attribute
        passwordConfirmationInput.value = '';  // Clear the password confirmation input
        toggleText.textContent = 'Don\'t have an account? Sign Up';
    } else {
        formTitle.textContent = 'Sign Up';
        passwordConfirmationContainer.style.display = 'block';  // Show the password confirmation field
        passwordConfirmationInput.setAttribute('required', 'required');  // Add the 'required' attribute
        toggleText.textContent = 'Already have an account? Sign In';
    }
    errorMessage.textContent = '';
    successMessage.textContent = '';
    form.reset();
});

function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Handle form submission (either sign up or sign in)
form.addEventListener('submit', function(e) {
    e.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;
    const passwordConfirmation = passwordConfirmationInput.value;

    // Reset messages
    errorMessage.textContent = '';
    successMessage.textContent = '';

    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (isSignIn) {
        // Sign In
        const existingUser = users.find(user => user.username === username);
        if (!existingUser) {
            errorMessage.textContent = 'Username not found!';
            return;
        }

        if (existingUser.password !== password) {
            errorMessage.textContent = 'Incorrect password!';
            return;
        }

        sessionStorage.setItem('userId', users.username);
        sessionStorage.setItem('userFullName', users.username);
        

        const sessionId = generateGUID();
        sessionStorage.setItem('sessionId', sessionId);

        successMessage.textContent = 'Sign In successful!';
        window.location.href = "chronicles.html";
    } else {
        // Sign Up
        const existingUser = users.find(user => user.username === username);
        if (existingUser) {
            errorMessage.textContent = 'User is already registered!';
            return;
        }

        if (password !== passwordConfirmation) {
            errorMessage.textContent = 'Passwords do not match!';
            return;
        }

        // Save the new user
        users.push({ username, password });
        localStorage.setItem('users', JSON.stringify(users));
        successMessage.textContent = 'Registration successful! Please Sign In.';
        form.reset();
        toggleText.textContent = 'Already have an account? Sign In';
        isSignIn = true;
        formTitle.textContent = 'Sign In';
        passwordConfirmationContainer.style.display = 'none';  // Hide the password confirmation field
        passwordConfirmationInput.removeAttribute('required');  // Remove the 'required' attribute
    }
});
