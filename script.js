'use strict';

const medicoSelect = document.getElementById('medico-select');
const pacientesAtendidosInput = document.getElementById('pacientes-atendidos');
const valorProcedimentosInput = document.getElementById('valor-procedimentos');
const calculationForm = document.getElementById('calculation-form');
const resultadoFinalElement = document.getElementById('resultado-final');
// Capturamos o elemento da label para poder mudar seu texto
const procedimentosLabel = document.querySelector('label[for="valor-procedimentos"]');

function popularListaMedicos() {
    medicos.forEach(medico => {
        const option = document.createElement('option');
        option.value = medico.id;
        option.textContent = medico.nome;
        medicoSelect.appendChild(option);
    });
}

function handleMedicoChange() {
    const medicoIdSelecionado = medicoSelect.value;
    const medicoSelecionado = medicos.find(m => m.id === medicoIdSelecionado);

    // Reseta para o padrão caso nenhum médico seja selecionado
    if (!medicoSelecionado || !medicoSelecionado.procedimento.faz) {
        procedimentosLabel.textContent = 'Valor Total dos Procedimentos (R$):';
        valorProcedimentosInput.placeholder = 'Ex: 350.50';
        valorProcedimentosInput.value = 0; // Limpa o valor
        return;
    }
    
    // Lógica para mudar a label e o placeholder
    if (medicoSelecionado.procedimento.tipo === 'fixo_por_procedimento') {
        procedimentosLabel.textContent = 'Quantidade de procedimentos realizados:';
        valorProcedimentosInput.placeholder = 'Ex: 3';
    } else {
        procedimentosLabel.textContent = 'Valor Total dos Procedimentos (R$):';
        valorProcedimentosInput.placeholder = 'Ex: 350.50';
    }
     valorProcedimentosInput.value = 0; // Limpa o valor ao trocar de médico
}

function handleCalculation(event) {
    event.preventDefault();

    const medicoIdSelecionado = medicoSelect.value;
    const totalPacientes = parseInt(pacientesAtendidosInput.value);
    const valorOuQtdProcedimentos = parseFloat(valorProcedimentosInput.value);

    const medicoSelecionado = medicos.find(m => m.id === medicoIdSelecionado);

    if (!medicoSelecionado) {
        alert('Por favor, selecione um médico.');
        return;
    }

    let pagamentoTotal = medicoSelecionado.valorPlantao;

    const pacientesExcedentes = totalPacientes - medicoSelecionado.limitePacientes;
    if (pacientesExcedentes > 0) {
        const valorExcedenteTotal = pacientesExcedentes * medicoSelecionado.valorExcedente;
        pagamentoTotal += valorExcedenteTotal;
    }
    
    // Lógica de cálculo de procedimento atualizada
    if (medicoSelecionado.procedimento.faz && valorOuQtdProcedimentos > 0) {
        if (medicoSelecionado.procedimento.tipo === 'fixo_por_procedimento') {
            const valorTotalProcedimentos = valorOuQtdProcedimentos * medicoSelecionado.procedimento.valor;
            pagamentoTotal += valorTotalProcedimentos;
        } else if (medicoSelecionado.procedimento.tipo === 'percentual_do_valor') {
            const valorRepasseProcedimento = valorOuQtdProcedimentos * medicoSelecionado.procedimento.percentualRepasse;
            pagamentoTotal += valorRepasseProcedimento;
        }
    }

    resultadoFinalElement.textContent = pagamentoTotal.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    });
}

// Adicionamos um "ouvinte" para o evento de MUDANÇA no seletor de médico
medicoSelect.addEventListener('change', handleMedicoChange);
calculationForm.addEventListener('submit', handleCalculation);

popularListaMedicos();