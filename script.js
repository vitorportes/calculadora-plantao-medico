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
const userEmailElement = document.getElementById('user-email');
// NOVO: Seleciona o container dos campos de cálculo
const camposCalculoContainer = document.getElementById('campos-calculo');


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

// --- FUNÇÕES DA CALCULADORA E INTERATIVIDADE ---
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

    // Se nenhum médico foi selecionado, oculta os campos e reseta
    if (!medicoIdSelecionado) {
        camposCalculoContainer.classList.remove('show');
        // Resetar os valores dos inputs para evitar cálculos errados se o usuário voltar atrás
        pacientesAtendidosInput.value = '';
        valorProcedimentosInput.value = '';
        resultadoFinalElement.textContent = 'R$ 0,00';
        return;
    }

    // Se um médico foi selecionado, mostra os campos
    camposCalculoContainer.classList.add('show');

    // Resetar campos para as configurações padrão do médico
    pacientesAtendidosInput.value = '';
    valorProcedimentosInput.value = '';
    resultadoFinalElement.textContent = 'R$ 0,00';


    // Lógica para ajustar labels e placeholders baseada no médico
    if (!medico || !medico.faz_procedimento) {
        procedimentosLabel.textContent = 'Valor Total dos Procedimentos (R$):';
        valorProcedimentosInput.placeholder = 'Ex: 350.50 (Não aplicável)';
        valorProcedimentosInput.value = 0; // Garante que seja 0 se não faz
        valorProcedimentosInput.disabled = true; // Desabilita o campo se não faz procedimento
    } else {
        valorProcedimentosInput.disabled = false; // Reabilita o campo
        if (medico.tipo_procedimento === 'fixo_por_procedimento') {
            procedimentosLabel.textContent = 'Quantidade de procedimentos realizados:';
            valorProcedimentosInput.placeholder = 'Ex: 3';
        } else { // percentual_do_valor
            procedimentosLabel.textContent = 'Valor Total dos Procedimentos (R$):';
            valorProcedimentosInput.placeholder = 'Ex: 350.50';
        }
    }
}

function handleCalculation(event) {
    event.preventDefault();

    const medicoIdSelecionado = medicoSelect.value;
    if (!medicoIdSelecionado) {
        alert('Por favor, selecione um médico.');
        return;
    }
    
    // Converte para número, usando 0 se o campo estiver vazio ou desabilitado
    const totalPacientes = parseInt(pacientesAtendidosInput.value || 0);
    const valorOuQtdProcedimentos = parseFloat(valorProcedimentosInput.value || 0);

    const medico = medicosData.find(m => m.id_texto === medicoIdSelecionado);

    let pagamentoTotal = medico.valor_plantao;

    const pacientesExcedentes = totalPacientes - medico.limite_pacientes;
    if (pacientesExcedentes > 0) {
        pagamentoTotal += pacientesExcedentes * medico.valor_excedente;
    }
    
    // Somente calcula procedimentos se o médico faz procedimento e o valor/quantidade for maior que 0
    if (medico.faz_procedimento && valorOuQtdProcedimentos > 0 && !valorProcedimentosInput.disabled) {
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