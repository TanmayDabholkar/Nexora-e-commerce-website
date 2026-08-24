function showLogin(event) {
    event?.preventDefault();
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
    loginForm.inert = false;
    signupForm.inert = true;
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('signupTab').classList.remove('active');
}

function showSignup(event) {
    event?.preventDefault();
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    signupForm.classList.add('active');
    loginForm.classList.remove('active');
    signupForm.inert = false;
    loginForm.inert = true;
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('signupTab').classList.add('active');
}

async function submitForm(form, endpoint, messageElement) {
    const button = form.querySelector('button[type="submit"]');
    const data = Object.fromEntries(new FormData(form));
    messageElement.textContent = '';
    button.disabled = true;
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        messageElement.textContent = result.message || result.error;
        messageElement.className = `form-message ${response.ok ? 'success' : 'error'}`;
        if (response.ok) {
            form.reset();
            if (endpoint === '/api/login') window.setTimeout(() => { window.location.href = '/'; }, 700);
        }
    } catch {
        messageElement.textContent = 'Could not reach the server. Run the site with "node server.js".';
        messageElement.className = 'form-message error';
    } finally {
        button.disabled = false;
    }
}

document.getElementById('signupForm').addEventListener('submit', event => {
    event.preventDefault();
    submitForm(event.currentTarget, '/api/register', document.getElementById('signupMessage'));
});

document.getElementById('loginForm').addEventListener('submit', event => {
    event.preventDefault();
    submitForm(event.currentTarget, '/api/login', document.getElementById('loginMessage'));
});

document.querySelectorAll('.password-toggle').forEach(button => {
    button.addEventListener('click', () => {
        const input = document.getElementById(button.getAttribute('aria-controls'));
        const isVisible = input.type === 'text';
        input.type = isVisible ? 'password' : 'text';
        button.textContent = isVisible ? 'Show' : 'Hide';
        button.setAttribute('aria-pressed', String(!isVisible));
    });
});
