import type { CID10, ModeloRelatorio } from '../types';

export const CID10_MOCK: CID10[] = [
  { codigo: 'F20.0', nome: 'Esquizofrenia paranóide' },
  { codigo: 'F20.1', nome: 'Esquizofrenia hebefrênica' },
  { codigo: 'F20.5', nome: 'Esquizofrenia residual' },
  { codigo: 'F25.0', nome: 'Transtorno esquizoafetivo tipo maníaco' },
  { codigo: 'F25.1', nome: 'Transtorno esquizoafetivo tipo depressivo' },
  { codigo: 'F31.0', nome: 'Transtorno afetivo bipolar, episódio atual hipomaníaco' },
  { codigo: 'F31.1', nome: 'Transtorno afetivo bipolar, episódio atual maníaco sem sintomas psicóticos' },
  { codigo: 'F31.9', nome: 'Transtorno afetivo bipolar, não especificado' },
  { codigo: 'F32.0', nome: 'Episódio depressivo leve' },
  { codigo: 'F32.1', nome: 'Episódio depressivo moderado' },
  { codigo: 'F32.2', nome: 'Episódio depressivo grave sem sintomas psicóticos' },
  { codigo: 'F33.0', nome: 'Transtorno depressivo recorrente, episódio atual leve' },
  { codigo: 'F33.1', nome: 'Transtorno depressivo recorrente, episódio atual moderado' },
  { codigo: 'F41.0', nome: 'Transtorno de pânico' },
  { codigo: 'F41.1', nome: 'Ansiedade generalizada' },
  { codigo: 'F42.0', nome: 'Transtorno obsessivo-compulsivo' },
  { codigo: 'F84.0', nome: 'Autismo infantil' },
];

export const MODELOS_INICIAIS: ModeloRelatorio[] = [
  {
    id: 'modelo-paliperidona',
    nome: 'Solicitação de Paliperidona',
    conteudo: `RELATÓRIO MÉDICO – SOLICITAÇÃO DE PALIPERIDONA PALMITATO

HISTÓRICO CLÍNICO:
Paciente com diagnóstico de Esquizofrenia Paranóide (CID-10: F20.0) desde [ANO DO DIAGNÓSTICO], apresentando sintomas positivos persistentes incluindo delírios persecutórios, alucinações auditivas e desorganização do pensamento. Ao longo do curso da doença, foram documentadas múltiplas internações psiquiátricas, evidenciando a gravidade e a recorrência dos episódios psicóticos.

TRATAMENTO ATUAL:
O paciente vem em uso de antipsicóticos orais (Risperidona 6mg/dia) com resposta clínica parcial. Observa-se baixa adesão ao tratamento oral, com frequentes abandonos e irregularidades na tomada da medicação, resultando em recaídas clínicas e reinternações hospitalares.

Tratamentos prévios incluíram: Haloperidol (até 15mg/dia), Olanzapina (até 20mg/dia) e Risperidona oral (até 8mg/dia), todos com resposta insuficiente ou efeitos colaterais significativos.

JUSTIFICATIVA DE TROCA:
Solicita-se a Paliperidona Palmitato (injetável de longa ação) pelas seguintes razões:
1. Baixa adesão documentada ao tratamento oral;
2. Múltiplas recaídas associadas à descontinuação da medicação;
3. O uso de antipsicótico injetável de longa ação proporcionará maior estabilidade dos níveis séricos e melhor controle sintomático;
4. Evidência científica robusta demonstrando superioridade da paliperidona injetável na prevenção de recaídas em pacientes com esquizofrenia e baixa adesão;
5. Melhora esperada na qualidade de vida e funcionalidade do paciente.

Diante do exposto, solicito a autorização para fornecimento de Paliperidona Palmitato conforme protocolo do Ministério da Saúde.`,
  },
  {
    id: 'modelo-litio',
    nome: 'Relatório para Carbonato de Lítio',
    conteudo: `RELATÓRIO MÉDICO – CARBONATO DE LÍTIO

HISTÓRICO CLÍNICO:
Paciente com diagnóstico de Transtorno Afetivo Bipolar (CID-10: F31.9) desde [ANO], com episódios maníacos e depressivos recorrentes. Apresenta história de [NÚMERO] internações psiquiátricas e comprometimento funcional significativo entre os episódios.

TRATAMENTO ATUAL:
Encontra-se em uso de [MEDICAÇÃO ATUAL] com controle parcial dos sintomas. A litemia vem sendo monitorada regularmente com resultados dentro da faixa terapêutica.

JUSTIFICATIVA:
O Carbonato de Lítio é considerado o tratamento de primeira linha para o Transtorno Bipolar, com evidência científica consolidada para:
1. Prevenção de episódios maníacos e depressivos;
2. Redução do risco de suicídio;
3. Estabilização do humor a longo prazo.

Solicita-se a continuidade/início do tratamento com Carbonato de Lítio [DOSE] mg/dia.`,
  },
];
