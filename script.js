'use strict';

import supabase from './supabase-client.js';

// --- SELEÇÃO DE ELEMENTOS DO DOM ---
let medicosData = [];
const medicoSelect = document.getElementById('medico-select');
const pacientesAtendidosInput = document.getElementById('pacientes-atendidos');
const valorProcedimentosInput = document.getElementById('valor-procedimentos');
const calculationForm = document.getElementById('calculation-form');
const resultadoFinalElement = document.getElementById('resultado-final');
const procedimentosLabel = document.querySelector('label[for="valor-procedimentos"]');
const logoutButton = document.getElementById('logout-button');
const userEmailElement = document.getElementById('user-email'); // Novo elemento

// --- FUNÇÕES DE AUTENTICAÇÃO E DADOS ---
async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Erro ao fazer logout:', error);
    } else {
        window.location.href = '/login.html';
    }
}

async function checkUserSession() {
    const { data, error } = await supabase.auth.getSession();
    if (!data.session || error) {
        window.location.href = '/login.html';
    } else {
        console.log('Usuário autenticado:', data.session.user.email);
        
        // --- NOVA LINHA ---
        // Exibe o e-mail do usuário na tela.
        userEmailElement.textContent = data.session.user.email;
        
        document.body.classList.remove('hidden');
        await carregarDadosDaCalculadora();
    }
}

async function carregarDadosDaCalculadora() {
    const { data, error } = await supabase
        .from('medicos')
        .select('*')
        .order('nome', { ascending: true });
    if (error) {
        console.error('Erro ao buscar dados dos médicos:', error);
        alert('Não foi possível carregar os dados dos médicos.');
    } else {
        medicosData = data;
        popularListaMedicos(medicosData);
    }
}

// --- FUNÇÕES DA CALCULADORA ---
function popularListaMedicos(medicos) {
    medicoSelect.innerHTML = '<option value="">-- Escolha um médico --</option>';
    medicos.forEach(medico => {
        const option = document.createElement('option');
        option.value = medico.id_texto;
        option.textContent = medico.nome;
        medicoSelect.appendChild(option);
    });
}

function handleMedicoChange() {
    const medicoIdSelecionado = medicoSelect.value;
    const medico = medicosData.find(m => m.id_texto === medicoIdSelecionado);
    if (!medico || !medico.faz_procedimento) {
        procedimentosLabel.textContent = 'Valor Total dos Procedimentos (R$):';
        valorProcedimentosInput.placeholder = 'Ex: 350.50';
        valorProcedimentosInput.value = 0;
        return;
    }
    if (medico.tipo_procedimento === 'fixo_por_procedimento') {
        procedimentosLabel.textContent = 'Quantidade de procedimentos realizados:';
        valorProcedimentosInput.placeholder = 'Ex: 3';
    } else {
        procedimentosLabel.textContent = 'Valor Total dos Procedimentos (R$):';
        valorProcedimentosInput.placeholder = 'Ex: 350.50';
    }
    valorProcedimentosInput.value = 0;
}

function handleCalculation(event) {
    event.preventDefault();
    const medicoIdSelecionado = medicoSelect.value;
    if (!medicoIdSelecionado) {
        alert('Por favor, selecione um médico.');
        return;
    }
    const totalPacientes = parseInt(pacientesAtendidosInput.value);
    const valorOuQtdProcedimentos = parseFloat(valorProcedimentosInput.value);
    const medico = medicosData.find(m => m.id_texto === medicoIdSelecionado);
    let pagamentoTotal = medico.valor_plantao;
    const pacientesExcedentes = totalPacientes - medico.limite_pacientes;
    if (pacientesExcedentes > 0) {
        pagamentoTotal += pacientesExcedentes * medico.valor_excedente;
    }
    if (medico.faz_procedimento && valorOuQtdProcedimentos > 0) {
        if (medico.tipo_procedimento === 'fixo_por_procedimento') {
            pagamentoTotal += valorOuQtdProcedimentos * medico.valor_procedimento;
        } else if (medico.tipo_procedimento === 'percentual_do_valor') {
            pagamentoTotal += valorOuQtdProcedimentos * medico.valor_procedimento;
        }
    }
    resultadoFinalElement.textContent = pagamentoTotal.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// --- EVENT LISTENERS ---
medicoSelect.addEventListener('change', handleMedicoChange);
calculationForm.addEventListener('submit', handleCalculation);
logoutButton.addEventListener('click', handleLogout);

// --- INICIALIZAÇÃO ---
checkUserSession();