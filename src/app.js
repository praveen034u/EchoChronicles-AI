// Configure AWS Amplify //this will be read from aws aplify config in lateer versions
aws_amplify.default.configure({
    Auth: {
        // Replace with your Cognito User Pool details
        userPoolId: "us-east-1_Re0MdnRiV",
        userPoolWebClientId: "1j1ja164ehv7iuelpu032q3g6r", // Replace with your App Client ID
        region: "us-east-1",
    }
});

const Auth = aws_amplify.Auth;

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

// Sign Up Function
async function signUp() {
  
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;
    const email = document.getElementById("signup-email").value;
    const birthdate = document.getElementById("signup-birthdate").value;
    const given_name = document.getElementById("signup-name").value;
    const name = document.getElementById("signup-given_name").value;
    const phone_number = document.getElementById("signup-phone_number").value;
    const gender = document.getElementById("signup-gender").value;
    if(username === "" || password === "" || email === "" || birthdate === "" || given_name === "" || name === "" || phone_number   === ""){
        return;
    }
    try {
        await Auth.signUp({
            username,
            password,
            attributes: { name, email,birthdate,gender, phone_number, given_name },
        });
        alert("Sign-up successful! Please check your email for the confirmation code.");
        toggleText.display = "none";
        document.getElementById("signup").style.display = "none";
        document.getElementById("confirm-signup").style.display = "block";
    } catch (error) {
        alert(`Error signing up: ${error.message}`);
    }
}

// Confirm Sign Up Function
async function confirmSignUp() {
  
    const username = document.getElementById("confirm-username").value;
    const code = document.getElementById("confirm-code").value;
    if(username === "" || code === ""){
        return;
    }

    try {
        await Auth.confirmSignUp(username, code);
        alert("Confirmation successful! You can now sign in.");
        document.getElementById("confirm-signup").style.display = "none";
        document.getElementById("signin").style.display = "block";
    } catch (error) {
        alert(`Error confirming sign up: ${error.message}`);
    }
}

// Sign In Function
async function signIn() {
    
    const username = document.getElementById("signin-username").value;
    const password = document.getElementById("signin-password").value;
    if(username === "" || password === ""){
        return;
    }

    try {
        const user = await Auth.signIn(username, password);
        console.log(user.username);
        document.getElementById("signin").style.display = "none";
        sessionStorage.setItem('userId', user.username);
        sessionStorage.setItem('userFullName', user.attributes.given_name);
        sessionStorage.setItem('sessionId', user.signInUserSession.idToken.jwtToken);
        window.location.href = "chronicles.html";
       
    } catch (error) {
    if (error.message.includes('Network')) {
        alert('System error oocured, please try again later');
        document.getElementById("signup").style.display = "none";
        document.getElementById("signin").style.display = "block";
    } else {       
        alert(`Error signing in: ${error.message}`);
    }
    }
}

// Sign Out Function
async function signOut() {
    try {
        await Auth.signOut();
        document.getElementById("welcome").style.display = "none";
        document.getElementById("signin").style.display = "block";
    } catch (error) {
        alert(`Error signing out: ${error.message}`);
    }
}

// Toggle between Sign Up and Sign In
let isSignIn = false;

toggleText.addEventListener('click', function() {
    
    isSignIn = !isSignIn;
    if (isSignIn) {
        document.getElementById("signup").style.display = "none";
        document.getElementById("signin").style.display = "block";
        formTitle.textContent = 'Sign In';
      
        toggleText.textContent = 'Don\'t have an account? Sign Up';
    } else {
        formTitle.textContent = 'Sign Up';
        document.getElementById("signin").style.display = "none";
        document.getElementById("signup").style.display = "block";
       
        toggleText.textContent = 'Already have an account? Sign In';
    }
    errorMessage.textContent = '';
    successMessage.textContent = '';
    form.reset();
});

