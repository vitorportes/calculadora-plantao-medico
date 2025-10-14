import supabase from './supabase-client.js';

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessageDiv = document.getElementById('error-message');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    // Usando a função de login do Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        // Se houver um erro, exibe a mensagem
        errorMessageDiv.textContent = 'E-mail ou senha inválidos.';
        console.error('Erro no login:', error.message);
    } else {
        // Se o login for bem-sucedido, redireciona para a página principal
        console.log('Login bem-sucedido:', data.user);
        window.location.href = '/index.html';
    }
});