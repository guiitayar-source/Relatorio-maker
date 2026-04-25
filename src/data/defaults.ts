import type { Medicamento, LMEData, Medico, RelatorioData } from '@/types';

export const emptyMedico = (): Omit<Medico, 'id'> => ({
  nomeCompleto: '',
  crm: '',
  cns: '',
  cpf: '',
});

export const emptyMedicamento = (): Medicamento => ({
  nome: '',
  quantidade: ['', '', '', '', '', ''],
});

export const initialLME: LMEData = {
  cnes: '',
  estabelecimento: '',
  nomePaciente: '',
  peso: '',
  altura: '',
  nomeMae: '',
  medicamentos: [emptyMedicamento()],
  cid_diagnostico: '',
  anamnese: '',
  tratamentoPrevio: '',
  capacidade: '',
  medicoSolicitanteId: '',
};

export const initialRelatorio = (): RelatorioData => ({
  paciente: '',
  dataNascimento: '',
  dataLaudo: new Date().toISOString().split('T')[0],
  cid_diagnostico: '',
  conteudo: '',
  medicoSolicitanteId: '',
});
