export interface Medico {
  id: string;
  nomeCompleto: string;
  crm: string;
  cns: string;
  cpf: string;
}

export interface CID10 {
  codigo: string;
  nome: string;
}

export interface Medicamento {
  nome: string;
  quantidade: [string, string, string, string, string, string]; // 1º ao 6º mês
}

export interface LMEData {
  cnes: string;
  estabelecimento: string;
  nomePaciente: string;
  peso: string;
  altura: string;
  nomeMae: string;
  medicamentos: Medicamento[];
  cid_diagnostico: string;
  anamnese: string;
  tratamentoPrevio: string;
  capacidade: string;
  medicoSolicitanteId: string;
}

export interface LmeModelo {
  id: string;
  nome: string;
  criadoEm: string;
  dados: LMEData;
}

export interface RelatorioData {
  paciente: string;
  dataNascimento: string;
  dataLaudo: string;
  cid_diagnostico: string;
  conteudo: string;
  medicoSolicitanteId: string;
}

export interface ModeloRelatorio {
  id: string;
  nome: string;
  conteudo: string;
}
