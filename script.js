'use strict';

import supabase from './supabase-client.js';

async function checkUserSession() {
    const { data, error } = await supabase.auth.getSession();

    if (!data.session || error) {
        window.location.href = '/login.html';
    } else {
        console.log('Usuário autenticado:', data.session.user.email);
        document.body.classList.remove('hidden');
    }
}
checkUserSession();


const medicoSelect = document.getElementById('medico-select');
const pacientesAtendidosInput = document.getElementById('pacientes-atendidos');
const valorProcedimentosInput = document.getElementById('valor-procedimentos');
const calculationForm = document.getElementById('calculation-form');
const resultadoFinalElement = document.getElementById('resultado-final');
const procedimentosLabel = document.querySelector('label[for="valor-procedimentos"]');

function popularListaMedicos() {
}

function handleMedicoChange() {

}

function handleCalculation(event) {
    event.preventDefault();

}

medicoSelect.addEventListener('change', handleMedicoChange);
calculationForm.addEventListener('submit', handleCalculation);

// popularListaMedicos(); // Linha antiga comentada