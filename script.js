'use strict';

import supabase from './supabase-client.js';

let medicosData = []; // Variável global para armazenar os dados dos médicos

const medicoSelect = document.getElementById('medico-select');
const pacientesAtendidosInput = document.getElementById('pacientes-atendidos');
const valorProcedimentosInput = document.getElementById('valor-procedimentos');
const calculationForm = document.getElementById('calculation-form');
const resultadoFinalElement = document.getElementById('resultado-final');
const procedimentosLabel = document.querySelector('label[for="valor-procedimentos"]');

async function checkUserSession() {
    const { data, error } = await supabase.auth.getSession();
    
    if (!data.session || error) {
        window.location.href = '/login.html';
    } else {
        console.log('Usuário autenticado:', data.session.user.email);
        document.body.classList.remove('hidden');
        // Se o usuário está logado, busca os dados para a calculadora.
        await carregarDadosDaCalculadora();
    }
}

async function carregarDadosDaCalculadora() {
    // Esta é a nova função que busca os dados no Supabase!
    const { data, error } = await supabase
        .from('medicos') // da tabela 'medicos'
        .select('*')    // selecione todas as colunas
        .order('nome', { ascending: true }); // e ordene pelo nome

    if (error) {
        console.error('Erro ao buscar dados dos médicos:', error);
        alert('Não foi possível carregar os dados dos médicos.');
    } else {
        medicosData = data; // Armazena os dados na nossa variável global
        popularListaMedicos(medicosData); // Popula a lista com os dados recebidos
    }
}

function popularListaMedicos(medicos) {
    // Limpa a lista antes de adicionar novas opções
    medicoSelect.innerHTML = '<option value="">-- Escolha um médico --</option>';
    medicos.forEach(medico => {
        const option = document.createElement('option');
        // Usamos id_texto que criamos no banco
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
            // Note que o campo no banco agora é 'valor_procedimento', não 'percentualRepasse'
            pagamentoTotal += valorOuQtdProcedimentos * medico.valor_procedimento;
        }
    }

    resultadoFinalElement.textContent = pagamentoTotal.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    });
}

// Adicionando os Event Listeners
medicoSelect.addEventListener('change', handleMedicoChange);
calculationForm.addEventListener('submit', handleCalculation);

// Inicia todo o fluxo da aplicação
checkUserSession();