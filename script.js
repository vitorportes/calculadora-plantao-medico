'use strict';

import supabase from './supabase-client.js';

// --- SELEÇÃO DE ELEMENTOS DO DOM ---
let medicosData = [];
const medicoSelect = document.getElementById('medico-select');
const logoutButton = document.getElementById('logout-button');
const userEmailElement = document.getElementById('user-email');

// Containers dinâmicos
const camposCalculoContainer = document.getElementById('campos-calculo');
const camposLiberalContainer = document.getElementById('campos-liberal');
const controlesFinaisContainer = document.getElementById('controles-finais');

// Inputs de Plantonistas
const pacientesAtendidosInput = document.getElementById('pacientes-atendidos');
const valorProcedimentosInput = document.getElementById('valor-procedimentos');
const procedimentosLabel = document.querySelector('label[for="valor-procedimentos"]');

// Inputs de Liberais
const valorTotalDiaInput = document.getElementById('valor-total-dia');

// Resultado
const resultadoTitulo = document.getElementById('resultado-titulo');
const resultadoFinalElement = document.getElementById('resultado-final');
const calculationForm = document.getElementById('calculation-form');


// --- FUNÇÕES DE LÓGICA DA APLICAÇÃO ---

function handleMedicoChange() {
    const medicoIdSelecionado = medicoSelect.value;
    const medico = medicosData.find(m => m.id_texto === medicoIdSelecionado);

    camposCalculoContainer.classList.remove('show');
    camposLiberalContainer.classList.remove('show');
    controlesFinaisContainer.classList.remove('show');
    resultadoFinalElement.textContent = 'R$ 0,00';
    pacientesAtendidosInput.value = '';
    valorProcedimentosInput.value = '';
    valorTotalDiaInput.value = '';

    if (!medicoIdSelecionado) return;

    controlesFinaisContainer.classList.add('show');
    
    // O título agora é sempre o mesmo
    resultadoTitulo.textContent = 'Valor a Pagar:';

    if (medico.tipo_vinculo === 'plantonista') {
        camposCalculoContainer.classList.add('show');
        if (!medico.faz_procedimento) {
            valorProcedimentosInput.disabled = true;
            procedimentosLabel.textContent = 'Procedimentos (Não aplicável)';
        } else {
            valorProcedimentosInput.disabled = false;
            procedimentosLabel.textContent = medico.tipo_procedimento === 'fixo_por_procedimento' ? 'Qtd. de Procedimentos:' : 'Valor Procedimentos (R$):';
        }
    } else if (medico.tipo_vinculo === 'liberal') {
        camposLiberalContainer.classList.add('show');
    }
}

function handleCalculation(event) {
    event.preventDefault();
    const medicoIdSelecionado = medicoSelect.value;
    const medico = medicosData.find(m => m.id_texto === medicoIdSelecionado);
    if (!medico) return;

    let valorFinal = 0;

    if (medico.tipo_vinculo === 'plantonista') {
        const totalPacientes = parseInt(pacientesAtendidosInput.value || 0);
        const valorOuQtdProcedimentos = parseFloat(valorProcedimentosInput.value || 0);
        
        valorFinal = medico.valor_plantao;
        const pacientesExcedentes = totalPacientes - medico.limite_pacientes;
        if (pacientesExcedentes > 0) {
            valorFinal += pacientesExcedentes * medico.valor_excedente;
        }
        if (medico.faz_procedimento && valorOuQtdProcedimentos > 0) {
            if (medico.tipo_procedimento === 'fixo_por_procedimento') {
                valorFinal += valorOuQtdProcedimentos * medico.valor_procedimento;
            } else if (medico.tipo_procedimento === 'percentual_do_valor') {
                valorFinal += valorOuQtdProcedimentos * medico.valor_procedimento;
            }
        }
    } else if (medico.tipo_vinculo === 'liberal') {
        const valorTotalDia = parseFloat(valorTotalDiaInput.value || 0);
        // --- CÁLCULO CORRIGIDO ---
        // Calcula a parte DO PROFISSIONAL, que é 100% - o percentual da clínica.
        valorFinal = valorTotalDia * (1 - medico.percentual_clinica / 100);
    }

    resultadoFinalElement.textContent = valorFinal.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}


// --- FUNÇÕES DE AUTENTICAÇÃO E CARREGAMENTO ---

async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login.html';
}

async function checkUserSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '/login.html';
    } else {
        userEmailElement.textContent = session.user.email;
        document.body.classList.remove('hidden');
        await carregarDadosDaCalculadora();
    }
}

async function carregarDadosDaCalculadora() {
    const { data, error } = await supabase.from('medicos').select('*').order('nome');
    if (error) {
        console.error('Erro ao buscar dados:', error);
    } else {
        medicosData = data;
        popularListaMedicos(medicosData);
    }
}

function popularListaMedicos(medicos) {
    medicoSelect.innerHTML = '<option value="">-- Escolha um profissional --</option>';
    medicos.forEach(medico => {
        const option = document.createElement('option');
        option.value = medico.id_texto;
        option.textContent = medico.nome;
        medicoSelect.appendChild(option);
    });
}

// --- EVENT LISTENERS ---
medicoSelect.addEventListener('change', handleMedicoChange);
calculationForm.addEventListener('submit', handleCalculation);
logoutButton.addEventListener('click', handleLogout);

// --- INICIALIZAÇÃO ---
checkUserSession();