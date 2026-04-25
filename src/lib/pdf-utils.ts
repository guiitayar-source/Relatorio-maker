import { PDFDocument, StandardFonts, PDFTextField, PDFDropdown, PDFName } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import type { LMEData, Medico, RelatorioData } from '@/types';

/**
 * Sanitiza nomes de arquivos para evitar caracteres inválidos
 */
export const sanitizeFilename = (name: string) => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_');
};

/**
 * Mapeamento de campos do PDF LME com múltiplos fallbacks
 */
const LME_FIELDS = {
  DIAGNOSIS: {
    UNIFIED: ['CID_diagnostico', 'CID_diagnóstico', 'CID', 'Diagnóstico'],
  },
  CLINICAL: {
    ANAMNESE: ['anamnese', 'Anamnese'],
    TREATMENTS: ['tratamentos prévios', 'Tratamentos prévios'],
  },
  DOCTOR: {
    NAME: ['text_115qt', 'ext_115qt', 'Text46', 'nome_medico'],
    CNS: ['CNS', 'TextCNS'],
    CPF: ['CPF preencher', 'CPF'],
    CRM: ['crm', 'CRM', 'Nome do preencher'],
  }
};

/**
 * Gera e baixa o PDF da LME preenchido
 */
export async function exportLmeToPdf(form: LMEData, selectedMedico?: Medico) {
  console.log('Iniciando exportação LME Blindada...', { form });
  
  try {
    const response = await fetch('/assets/lme-template.pdf');
    if (!response.ok) throw new Error('Falha ao carregar template');
    
    const pdfDoc = await PDFDocument.load(await response.arrayBuffer());
    const pdfForm = pdfDoc.getForm();
    const page = pdfDoc.getPages()[0];
    const { height } = page.getSize();
    
    // 1. Camada de Segurança: Embutir fonte explicitamente
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    /**
     * Helper robusto para preencher campos com fallbacks e tamanho fixo
     */
    const fill = (names: string | string[], value: any, fontSize: number = 9) => {
      const fieldNames = Array.isArray(names) ? names : [names];
      const textValue = String(value || '');
      
      for (const name of fieldNames) {
        try {
          const field = pdfForm.getField(name);
          if (field instanceof PDFTextField) {
            field.setText(textValue);
            // 2. Camada de Segurança: Forçar tamanho da fonte (evita Auto-size invisível)
            field.setFontSize(fontSize);
          } else if (field instanceof PDFDropdown) {
            try { field.select(textValue); } catch (e) {}
          }
        } catch (e) { /* ignore */ }
      }
    };

    // 1. Dados do Paciente e Estabelecimento
    fill('estabelecimento', form.estabelecimento, 9);
    fill('nome_paciente', form.nomePaciente, 9);
    fill('mãe_paciente', form.nomeMae, 9);
    fill(['cnes', 'CNES'], form.cnes, 9);

    // ESTRATÉGIA DE ELITE PARA PESO E ALTURA (Carimbo de Precisão)
    const carimbarNoCampo = (campoNome: string, valor: string) => {
      try {
        const field = pdfForm.getTextField(campoNome);
        const widgets = field.acroField.getWidgets();
        if (widgets.length > 0 && valor) {
          const rect = widgets[0].getRectangle();
          page.drawText(String(valor), {
            x: rect.x + 2,
            y: rect.y + (rect.height / 4),
            size: 9,
            font: helvetica,
          });
          // Não fazemos field.setText() para evitar a sobreposição
        }
      } catch (e) {
        // Fallback manual se o campo não for encontrado por nome
        if (campoNome === 'peso') {
          page.drawText(String(valor), { x: 475, y: 535, size: 9, font: helvetica });
        }
      }
    };

    carimbarNoCampo('peso', form.peso);
    carimbarNoCampo('altura', form.altura);

    // 2. Diagnóstico
    fill(LME_FIELDS.DIAGNOSIS.UNIFIED, form.cid_diagnostico, 9);
    fill(LME_FIELDS.CLINICAL.ANAMNESE, form.anamnese, 6);
    fill(LME_FIELDS.CLINICAL.TREATMENTS, form.tratamentoPrevio, 6);

    if (selectedMedico) {
      fill(LME_FIELDS.DOCTOR.NAME, selectedMedico.nomeCompleto, 9);
      fill(LME_FIELDS.DOCTOR.CNS, selectedMedico.cns, 9);
      fill(LME_FIELDS.DOCTOR.CPF, selectedMedico.cpf, 9);
      fill(LME_FIELDS.DOCTOR.CRM, selectedMedico.crm, 9);
    }

    form.medicamentos.forEach((med, i) => {
      const n = i + 1;
      if (!med.nome) return;

      if (n <= 4) {
        const medFieldNames = n === 1 ? ['med1_WLLX', 'med1'] : [`med${n}`];
        fill(medFieldNames, med.nome, 7);
        med.quantidade.forEach((qty, m) => {
          fill(`qtdmed${n}_mes${m + 1}`, qty, 8);
        });
      } else {
        const yPos = [390, 370][i - 4];
        const xPos = [370, 410, 450, 490, 530, 570];
        fill(`Selecao med ${n}`, med.nome, 7);
        med.quantidade.forEach((qty, m) => {
          if (qty) page.drawText(String(qty), { x: xPos[m], y: yPos, size: 9, font: helvetica });
        });
      }
    });

    // 3. Camada de Segurança: Update com fonte e Deletar NeedAppearances
    pdfForm.updateFieldAppearances(helvetica);
    
    // O pulo do gato sugerido pelo outro Gemini (com correção de segurança):
    try {
      const acroForm = pdfDoc.catalog.get(PDFName.of('AcroForm'));
      if (acroForm && (acroForm as any).delete) {
        (acroForm as any).delete(PDFName.of('NeedAppearances'));
      }
    } catch (e) {
      console.warn('Não foi possível deletar NeedAppearances, mas continuando...', e);
    }
    
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LME_${sanitizeFilename(form.nomePaciente || 'doc')}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Erro PDF LME:', error);
    alert('Erro ao gerar o PDF.');
  }
}

export async function debugLmeFields() {
  try {
    const response = await fetch('/assets/lme-template.pdf');
    const pdfDoc = await PDFDocument.load(await response.arrayBuffer());
    const pdfForm = pdfDoc.getForm();
    pdfForm.getFields().forEach(field => {
      try {
        if (field instanceof PDFTextField) {
          field.setText(field.getName());
          field.setFontSize(6);
        }
      } catch (e) {}
    });
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'LME_DEBUG_FIELDS.pdf';
    link.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Erro no debug:', e);
  }
}

export function exportRelatorioToPdf(form: RelatorioData, selectedMedico?: Medico) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 25;

  doc.setFont('helvetica', 'bold').setFontSize(14);
  doc.text('RELATÓRIO MÉDICO', pageWidth / 2, y, { align: 'center' });
  
  doc.setFont('helvetica', 'normal').setFontSize(10);
  y += 15;

  const addLine = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold').text(`${label}: `, 20, y);
    doc.setFont('helvetica', 'normal').text(value || '', 20 + doc.getTextWidth(`${label}: `), y);
    y += 7;
  };

  addLine('Paciente', form.paciente);
  addLine('CID-10', form.cid_diagnostico || '');
  y += 5;

  const lines = doc.splitTextToSize(form.conteudo || '', pageWidth - 40);
  doc.text(lines, 20, y);

  if (selectedMedico) {
    y = 260;
    doc.text('_________________________________', pageWidth / 2, y, { align: 'center' });
    doc.setFont('helvetica', 'bold').text(selectedMedico.nomeCompleto, pageWidth / 2, y + 7, { align: 'center' });
    doc.setFont('helvetica', 'normal').text(`CRM: ${selectedMedico.crm}`, pageWidth / 2, y + 12, { align: 'center' });
  }

  doc.save(`Relatorio_${sanitizeFilename(form.paciente || 'doc')}.pdf`);
}
