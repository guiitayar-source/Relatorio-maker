import type { CID10, ModeloRelatorio } from '../types';

export const CID10_MOCK: CID10[] = [
  // F00-F09: Transtornos mentais orgânicos
  { codigo: 'F00', nome: 'Demência na doença de Alzheimer' },
  { codigo: 'F01', nome: 'Demência vascular' },
  { codigo: 'F03', nome: 'Demência não especificada' },
  { codigo: 'F05', nome: 'Delirium não sobreposto a uma demência' },
  { codigo: 'F06.3', nome: 'Transtornos do humor [afetivos] orgânicos' },
  
  // F10-F19: Transtornos por uso de substâncias
  { codigo: 'F10.0', nome: 'Transtornos mentais e comportamentais devidos ao uso de álcool - intoxicação aguda' },
  { codigo: 'F10.2', nome: 'Transtornos mentais e comportamentais devidos ao uso de álcool - síndrome de dependência' },
  { codigo: 'F11.2', nome: 'Transtornos mentais e comportamentais devidos ao uso de opiáceos - síndrome de dependência' },
  { codigo: 'F12.2', nome: 'Transtornos mentais e comportamentais devidos ao uso de canabinóides - síndrome de dependência' },
  { codigo: 'F13.2', nome: 'Transtornos mentais e comportamentais devidos ao uso de sedativos ou hipnóticos - dependência' },
  { codigo: 'F14.2', nome: 'Transtornos mentais e comportamentais devidos ao uso de cocaína - síndrome de dependência' },
  { codigo: 'F15.2', nome: 'Transtornos mentais e comportamentais devidos ao uso de outros estimulantes - dependência' },
  { codigo: 'F17.2', nome: 'Transtornos mentais e comportamentais devidos ao uso de fumo - síndrome de dependência' },
  { codigo: 'F19.2', nome: 'Transtornos mentais e comportamentais devidos ao uso de múltiplas drogas - dependência' },

  // F20-F29: Esquizofrenia e transtornos delirantes
  { codigo: 'F20.0', nome: 'Esquizofrenia paranóide' },
  { codigo: 'F20.1', nome: 'Esquizofrenia hebefrênica' },
  { codigo: 'F20.2', nome: 'Esquizofrenia catatônica' },
  { codigo: 'F20.3', nome: 'Esquizofrenia indiferenciada' },
  { codigo: 'F20.5', nome: 'Esquizofrenia residual' },
  { codigo: 'F20.6', nome: 'Esquizofrenia simples' },
  { codigo: 'F21', nome: 'Transtorno esquizotípico' },
  { codigo: 'F22.0', nome: 'Transtorno delirante' },
  { codigo: 'F23', nome: 'Transtornos psicóticos agudos e transitórios' },
  { codigo: 'F25.0', nome: 'Transtorno esquizoafetivo tipo maníaco' },
  { codigo: 'F25.1', nome: 'Transtorno esquizoafetivo tipo depressivo' },
  { codigo: 'F25.2', nome: 'Transtorno esquizoafetivo tipo misto' },
  { codigo: 'F29', nome: 'Psicose não-orgânica não especificada' },

  // F30-F39: Transtornos do humor [afetivos]
  { codigo: 'F30', nome: 'Episódio maníaco' },
  { codigo: 'F31.0', nome: 'Transtorno afetivo bipolar, episódio atual hipomaníaco' },
  { codigo: 'F31.1', nome: 'Transtorno afetivo bipolar, episódio atual maníaco sem sintomas psicóticos' },
  { codigo: 'F31.2', nome: 'Transtorno afetivo bipolar, episódio atual maníaco com sintomas psicóticos' },
  { codigo: 'F31.3', nome: 'Transtorno afetivo bipolar, episódio atual depressivo leve ou moderado' },
  { codigo: 'F31.4', nome: 'Transtorno afetivo bipolar, episódio atual depressivo grave sem sintomas psicóticos' },
  { codigo: 'F31.5', nome: 'Transtorno afetivo bipolar, episódio atual depressivo grave com sintomas psicóticos' },
  { codigo: 'F31.6', nome: 'Transtorno afetivo bipolar, episódio atual misto' },
  { codigo: 'F31.7', nome: 'Transtorno afetivo bipolar, atualmente em remissão' },
  { codigo: 'F31.8', nome: 'Outros transtornos afetivos bipolares' },
  { codigo: 'F31.9', nome: 'Transtorno afetivo bipolar, não especificado' },
  { codigo: 'F32.0', nome: 'Episódio depressivo leve' },
  { codigo: 'F32.1', nome: 'Episódio depressivo moderado' },
  { codigo: 'F32.2', nome: 'Episódio depressivo grave sem sintomas psicóticos' },
  { codigo: 'F32.3', nome: 'Episódio depressivo grave com sintomas psicóticos' },
  { codigo: 'F33.0', nome: 'Transtorno depressivo recorrente, episódio atual leve' },
  { codigo: 'F33.1', nome: 'Transtorno depressivo recorrente, episódio atual moderado' },
  { codigo: 'F33.2', nome: 'Transtorno depressivo recorrente, episódio atual grave sem sintomas psicóticos' },
  { codigo: 'F33.3', nome: 'Transtorno depressivo recorrente, episódio atual grave com sintomas psicóticos' },
  { codigo: 'F34.0', nome: 'Ciclotimia' },
  { codigo: 'F34.1', nome: 'Distimia' },

  // F40-F48: Transtornos neuróticos e relacionados ao estresse
  { codigo: 'F40.0', nome: 'Agorafobia' },
  { codigo: 'F40.1', nome: 'Fobias sociais' },
  { codigo: 'F41.0', nome: 'Transtorno de pânico' },
  { codigo: 'F41.1', nome: 'Ansiedade generalizada' },
  { codigo: 'F41.2', nome: 'Transtorno misto ansioso e depressivo' },
  { codigo: 'F42.0', nome: 'Transtorno obsessivo-compulsivo' },
  { codigo: 'F43.0', nome: 'Reação aguda ao estresse' },
  { codigo: 'F43.1', nome: 'Transtorno de estresse pós-traumático' },
  { codigo: 'F43.2', nome: 'Transtornos de adaptação' },
  { codigo: 'F44', nome: 'Transtornos dissociativos [de conversão]' },
  { codigo: 'F45', nome: 'Transtornos somatoformes' },
  { codigo: 'F48.0', nome: 'Neurastenia' },

  // F50-F59: Síndromes comportamentais associadas a fatores físicos
  { codigo: 'F50.0', nome: 'Anorexia nervosa' },
  { codigo: 'F50.2', nome: 'Bulimia nervosa' },
  { codigo: 'F51.0', nome: 'Insônia não-orgânica' },
  { codigo: 'F53.0', nome: 'Transtornos mentais e comportamentais leves associados ao puerpério' },

  // F60-F69: Transtornos da personalidade e do comportamento adulto
  { codigo: 'F60.0', nome: 'Transtorno da personalidade paranóide' },
  { codigo: 'F60.1', nome: 'Transtorno da personalidade esquizóide' },
  { codigo: 'F60.2', nome: 'Transtorno da personalidade antissocial' },
  { codigo: 'F60.3', nome: 'Transtorno da personalidade emocionalmente instável' },
  { codigo: 'F60.31', nome: 'Transtorno da personalidade tipo borderline' },
  { codigo: 'F60.4', nome: 'Transtorno da personalidade histriônica' },
  { codigo: 'F60.5', nome: 'Transtorno da personalidade anancástica' },
  { codigo: 'F60.6', nome: 'Transtorno da personalidade ansiosa [esquiva]' },
  { codigo: 'F60.7', nome: 'Transtorno da personalidade dependente' },

  // F70-F79: Retardo mental
  { codigo: 'F70', nome: 'Retardo mental leve' },
  { codigo: 'F71', nome: 'Retardo mental moderado' },
  { codigo: 'F72', nome: 'Retardo mental grave' },
  { codigo: 'F73', nome: 'Retardo mental profundo' },

  // F80-F89: Transtornos do desenvolvimento psicológico
  { codigo: 'F80', nome: 'Transtornos específicos do desenvolvimento da fala e da linguagem' },
  { codigo: 'F81', nome: 'Transtornos específicos do desenvolvimento das habilidades escolares' },
  { codigo: 'F84.0', nome: 'Autismo infantil' },
  { codigo: 'F84.1', nome: 'Autismo atípico' },
  { codigo: 'F84.2', nome: 'Síndrome de Rett' },
  { codigo: 'F84.5', nome: 'Síndrome de Asperger' },

  // F90-F98: Transtornos do comportamento e emocionais (infância/adolescência)
  { codigo: 'F90.0', nome: 'Distúrbios da atividade e da atenção (TDAH)' },
  { codigo: 'F90.1', nome: 'Transtorno hipercinético de conduta' },
  { codigo: 'F91', nome: 'Distúrbios de conduta' },
  { codigo: 'F92', nome: 'Transtornos mistos de conduta e das emoções' },
  { codigo: 'F93', nome: 'Transtornos emocionais com início específico na infância' },
  { codigo: 'F95', nome: 'Tiques' },
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
