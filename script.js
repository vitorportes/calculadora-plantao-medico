'use strict';

const medicoSelect = document.getElementById('medico-select');
const pacientesAtendidosInput = document.getElementById('pacientes-atendidos');
const valorProcedimentosInput = document.getElementById('valor-procedimentos');
const calculationForm = document.getElementById('calculation-form');
const resultadoFinalElement = document.getElementById('resultado-final');

function popularListaMedicos() {
    medicos.forEach(medico => {
        const option = document.createElement('option');
        option.value = medico.id;
        option.textContent = medico.nome;
        medicoSelect.appendChild(option);
    });
}

function handleCalculation(event) {
    event.preventDefault();

    const medicoIdSelecionado = medicoSelect.value;
    const totalPacientes = parseInt(pacientesAtendidosInput.value);
    const valorProcedimentos = parseFloat(valorProcedimentosInput.value);

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

    if (medicoSelecionado.procedimento.faz && valorProcedimentos > 0) {
        const valorRepasseProcedimento = valorProcedimentos * medicoSelecionado.procedimento.percentualRepasse;
        pagamentoTotal += valorRepasseProcedimento;
    }

    resultadoFinalElement.textContent = pagamentoTotal.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    });
}

calculationForm.addEventListener('submit', handleCalculation);

popularListaMedicos();