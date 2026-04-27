import { PDFDocument, StandardFonts, PDFTextField, PDFDropdown, PDFForm, PDFFont, PDFPage } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import type { LMEData, Medico, RelatorioData } from '@/types';
import { CLINIC_INFO, DOCUMENT_TITLES } from './constants';

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
 * Salva o PDF seguindo as regras de casting de memória e limpeza, ou via IPC se no Electron
 */
const savePdfFile = async (pdfBytes: Uint8Array, fileName: string) => {
  const finalFileName = fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`;

  try {
    if (window.electronAPI && window.electronAPI.saveFile) {
      // Modo Desktop (Electron)
      // Enviar uma cópia limpa do buffer para evitar erros de clonagem
      const buffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength);
      const success = await window.electronAPI.saveFile(buffer, finalFileName);
      if (!success) {
        console.log('Salvamento cancelado ou falhou.');
      }
    } else {
      // Modo Web
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (err) {
    console.error('Erro ao salvar PDF:', err);
    alert('Erro ao salvar o arquivo PDF localmente.');
  }
};

const drawReportHeaderFooter = (pdf: jsPDF, logo1: Uint8Array, logo2: Uint8Array) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Cabeçalho
  pdf.addImage(logo1, 'PNG', 15, 8, 35, 22);
  
  pdf.setFont('helvetica', 'normal').setFontSize(14);
  const clinicNameLines = pdf.splitTextToSize(CLINIC_INFO.NAME, 80);
  pdf.text(clinicNameLines, pageWidth / 2, 18, { align: 'center' });
  
  pdf.addImage(logo2, 'PNG', pageWidth - 55, 8, 40, 28);

  // Rodapé
  const footerY = pageHeight - 30;
  pdf.setDrawColor(0);
  pdf.setLineWidth(0.2);
  pdf.line(20, footerY, pageWidth - 20, footerY);
  
  pdf.setFont('helvetica', 'normal').setFontSize(10);
  pdf.text('Assinatura/Carimbo', pageWidth - 20, footerY + 5, { align: 'right' });
  
  pdf.setFontSize(11);
  pdf.text(CLINIC_INFO.ADDRESS, pageWidth / 2, footerY + 15, { align: 'center' });
  pdf.setFontSize(12);
  pdf.text(CLINIC_INFO.PHONE, pageWidth / 2, footerY + 22, { align: 'center' });
};

/**
 * Gera e baixa o PDF de Relatório Médico
 */
export async function exportRelatorioToPdf(form: RelatorioData, selectedMedico?: Medico) {
  console.log('Iniciando exportação Relatório...');
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const [logo1, logo2] = await Promise.all([
      fetch(CLINIC_INFO.LOGOS.PRIMARY).then(r => r.arrayBuffer()).then(ab => new Uint8Array(ab)),
      fetch(CLINIC_INFO.LOGOS.SECONDARY).then(r => r.arrayBuffer()).then(ab => new Uint8Array(ab))
    ]);

    const drawHFRenderer = () => drawReportHeaderFooter(doc, logo1, logo2);
    drawHFRenderer();

    let y = 45;
    doc.setFont('helvetica', 'bold').setFontSize(16);
    doc.text(DOCUMENT_TITLES.RELATORIO_MEDICO, pageWidth / 2, y, { align: 'center' });
    
    doc.setFont('helvetica', 'normal').setFontSize(11);
    y += 15;

    const addLine = (label: string, value: string) => {
      if (y > pageHeight - 60) {
        doc.addPage();
        drawHFRenderer();
        y = 45;
      }
      doc.setFont('helvetica', 'bold').text(`${label}: `, 20, y);
      doc.setFont('helvetica', 'normal').text(value || '', 20 + doc.getTextWidth(`${label}: `), y);
      y += 8;
    };

    addLine('Paciente', form.paciente || '___');
    addLine('Data de Nascimento', form.dataNascimento ? new Date(form.dataNascimento + 'T12:00:00').toLocaleDateString('pt-BR') : '___');
    addLine('Data do Laudo', form.dataLaudo ? new Date(form.dataLaudo + 'T12:00:00').toLocaleDateString('pt-BR') : '___');
    addLine('CID-10', form.cid_diagnostico || '___');
    y += 5;

    const lines = doc.splitTextToSize(form.conteudo || '', pageWidth - 40);
    lines.forEach((line: string) => {
      if (y > pageHeight - 50) {
        doc.addPage();
        drawHFRenderer();
        y = 45;
      }
      doc.text(line, 20, y);
      y += 6;
    });

    if (selectedMedico) {
      if (y > pageHeight - 80) {
        doc.addPage();
        drawHFRenderer();
        y = 60;
      } else {
        y += 15;
      }
      doc.text('_________________________________', pageWidth / 2, y, { align: 'center' });
      doc.setFont('helvetica', 'bold').text(selectedMedico.nomeCompleto, pageWidth / 2, y + 7, { align: 'center' });
      doc.setFont('helvetica', 'normal').text(`CRM: ${selectedMedico.crm}`, pageWidth / 2, y + 12, { align: 'center' });
    }

    const fileName = `Relatorio_${sanitizeFilename(form.paciente || 'documento')}.pdf`;
    const pdfBytes = new Uint8Array(doc.output('arraybuffer'));
    savePdfFile(pdfBytes, fileName);
  } catch (e) {
    console.error('Erro ao exportar Relatório:', e);
    alert('Erro ao gerar PDF do relatório.');
  }
}

export async function generateRelatorioPdfBlob(form: RelatorioData, selectedMedico?: Medico): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const [logo1, logo2] = await Promise.all([
    fetch(CLINIC_INFO.LOGOS.PRIMARY).then(r => r.arrayBuffer()).then(ab => new Uint8Array(ab)),
    fetch(CLINIC_INFO.LOGOS.SECONDARY).then(r => r.arrayBuffer()).then(ab => new Uint8Array(ab))
  ]);

  const drawHFRenderer = () => drawReportHeaderFooter(doc, logo1, logo2);
  drawHFRenderer();

  let y = 45;
  doc.setFont('helvetica', 'bold').setFontSize(16);
  doc.text(DOCUMENT_TITLES.RELATORIO_MEDICO, pageWidth / 2, y, { align: 'center' });
  
  doc.setFont('helvetica', 'normal').setFontSize(11);
  y += 15;

  const addLine = (label: string, value: string) => {
    if (y > pageHeight - 60) {
      doc.addPage();
      drawHFRenderer();
      y = 45;
    }
    doc.setFont('helvetica', 'bold').text(`${label}: `, 20, y);
    doc.setFont('helvetica', 'normal').text(value || '', 20 + doc.getTextWidth(`${label}: `), y);
    y += 8;
  };

  addLine('Paciente', form.paciente || '___');
  addLine('Data de Nascimento', form.dataNascimento ? new Date(form.dataNascimento + 'T12:00:00').toLocaleDateString('pt-BR') : '___');
  addLine('Data do Laudo', form.dataLaudo ? new Date(form.dataLaudo + 'T12:00:00').toLocaleDateString('pt-BR') : '___');
  addLine('CID-10', form.cid_diagnostico || '___');
  y += 5;

  const lines = doc.splitTextToSize(form.conteudo || '', pageWidth - 40);
  lines.forEach((line: string) => {
    if (y > pageHeight - 50) {
      doc.addPage();
      drawHFRenderer();
      y = 45;
    }
    doc.text(line, 20, y);
    y += 6;
  });

  if (selectedMedico) {
    if (y > pageHeight - 80) {
      doc.addPage();
      drawHFRenderer();
      y = 60;
    } else {
      y += 15;
    }
    doc.text('_________________________________', pageWidth / 2, y, { align: 'center' });
    doc.setFont('helvetica', 'bold').text(selectedMedico.nomeCompleto, pageWidth / 2, y + 7, { align: 'center' });
    doc.setFont('helvetica', 'normal').text(`CRM: ${selectedMedico.crm}`, pageWidth / 2, y + 12, { align: 'center' });
  }

  const pdfBytes = new Uint8Array(doc.output('arraybuffer'));
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

// --- PDF Helpers ---

const loadTemplate = async (path: string): Promise<PDFDocument> => {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Falha ao carregar template: ${response.status} ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  return await PDFDocument.load(arrayBuffer);
};

interface FillOptions {
  fontSize?: number;
  font?: PDFFont;
}

const fillFormField = (pdfForm: PDFForm, names: string | string[], value: any, options: FillOptions = {}) => {
  const { fontSize = 9 } = options;
  const fieldNames = Array.isArray(names) ? names : [names];
  const textValue = String(value ?? '');
  
  for (const name of fieldNames) {
    try {
      const field = pdfForm.getField(name);
      if (field instanceof PDFTextField) {
        field.setText(textValue);
        field.setFontSize(fontSize);
      } else if (field instanceof PDFDropdown) {
        try { field.select(textValue); } catch (e) {}
      }
    } catch (e) {
      // Field not found or other issue, ignore as per original logic
    }
  }
};

const stampAtField = (
  pdfForm: PDFForm, 
  page: PDFPage, 
  font: PDFFont, 
  fieldName: string, 
  value: any, 
  fontSize = 9
) => {
  if (!value) return;
  
  try {
    const field = pdfForm.getTextField(fieldName);
    const widgets = field.acroField.getWidgets();
    if (widgets.length > 0) {
      const rect = widgets[0].getRectangle();
      page.drawText(String(value), {
        x: rect.x + 2,
        y: rect.y + (rect.height / 4),
        size: fontSize,
        font,
      });
    }
  } catch (e) {
    // Fallback if field not found, though original logic had specific fallback for 'peso'
    if (fieldName === 'peso') {
      page.drawText(String(value), { x: 475, y: 535, size: fontSize, font });
    }
  }
};

// --- LME Logic ---

const LME_FIELDS = {
  DIAGNOSIS: ['CID_diagnostico', 'CID_diagnóstico', 'CID', 'Diagnóstico'],
  ANAMNESE: ['anamnese', 'Anamnese'],
  TREATMENTS: ['tratamentos prévios', 'Tratamentos prévios'],
  DOCTOR: {
    NAME: ['text_115qt', 'ext_115qt', 'Text46', 'nome_medico'],
    CNS: ['CNS', 'TextCNS'],
    CPF: ['CPF preencher', 'CPF'],
    CRM: ['crm', 'CRM', 'Nome do preencher'],
  }
};

const fillMedications = (pdfForm: PDFForm, page: PDFPage, font: PDFFont, medications: LMEData['medicamentos']) => {
  medications.forEach((med, i) => {
    const n = i + 1;
    if (!med.nome) return;

    if (n <= 4) {
      const medFieldNames = n === 1 ? ['med1_WLLX', 'med1'] : [`med${n}`];
      fillFormField(pdfForm, medFieldNames, med.nome, { fontSize: 7 });
      med.quantidade.forEach((qty, m) => {
        fillFormField(pdfForm, `qtdmed${n}_mes${m + 1}`, qty, { fontSize: 8 });
      });
    } else {
      const yPos = [390, 370][i - 4];
      const xPos = [370, 410, 450, 490, 530, 570];
      fillFormField(pdfForm, `Selecao med ${n}`, med.nome, { fontSize: 7 });
      med.quantidade.forEach((qty, m) => {
        if (qty) page.drawText(String(qty), { x: xPos[m], y: yPos, size: 9, font });
      });
    }
  });
};

/**
 * Gera e baixa o PDF da LME preenchido
 */
export async function exportLmeToPdf(form: LMEData, selectedMedico?: Medico) {
  console.log('Iniciando exportação LME...', { form });
  
  try {
    const pdfDoc = await loadTemplate('assets/lme-template.pdf');
    const pdfForm = pdfDoc.getForm();
    const page = pdfDoc.getPages()[0];
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Preenchimento de campos básicos
    fillFormField(pdfForm, 'estabelecimento', form.estabelecimento);
    fillFormField(pdfForm, 'nome_paciente', form.nomePaciente);
    fillFormField(pdfForm, 'mãe_paciente', form.nomeMae);
    fillFormField(pdfForm, ['cnes', 'CNES'], form.cnes);

    // Campos que precisam de "carimbo" (drawText)
    stampAtField(pdfForm, page, helvetica, 'peso', form.peso);
    stampAtField(pdfForm, page, helvetica, 'altura', form.altura);

    // Diagnóstico e Clínica
    fillFormField(pdfForm, LME_FIELDS.DIAGNOSIS, form.cid_diagnostico);
    fillFormField(pdfForm, LME_FIELDS.ANAMNESE, form.anamnese, { fontSize: 6 });
    fillFormField(pdfForm, LME_FIELDS.TREATMENTS, form.tratamentoPrevio, { fontSize: 6 });

    // Médico
    if (selectedMedico) {
      fillFormField(pdfForm, LME_FIELDS.DOCTOR.NAME, selectedMedico.nomeCompleto);
      fillFormField(pdfForm, LME_FIELDS.DOCTOR.CNS, selectedMedico.cns);
      fillFormField(pdfForm, LME_FIELDS.DOCTOR.CPF, selectedMedico.cpf);
      fillFormField(pdfForm, LME_FIELDS.DOCTOR.CRM, selectedMedico.crm);
    }

    // Medicamentos
    fillMedications(pdfForm, page, helvetica, form.medicamentos);

    console.log('Finalizando PDF...');
    pdfForm.updateFieldAppearances(helvetica);
    
    const pdfBytes = await pdfDoc.save();
    const fileName = `LME_${sanitizeFilename(form.nomePaciente || 'documento')}.pdf`;
    savePdfFile(pdfBytes, fileName);
    
  } catch (error) {
    console.error('Erro PDF LME:', error);
    alert('Erro ao gerar o PDF. Verifique o console para mais detalhes.');
  }
}

export async function generateLmePdfBlob(form: LMEData, selectedMedico?: Medico): Promise<Blob> {
  const pdfDoc = await loadTemplate('assets/lme-template.pdf');
  const pdfForm = pdfDoc.getForm();
  const page = pdfDoc.getPages()[0];
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  fillFormField(pdfForm, 'estabelecimento', form.estabelecimento);
  fillFormField(pdfForm, 'nome_paciente', form.nomePaciente);
  fillFormField(pdfForm, 'mãe_paciente', form.nomeMae);
  fillFormField(pdfForm, ['cnes', 'CNES'], form.cnes);

  stampAtField(pdfForm, page, helvetica, 'peso', form.peso);
  stampAtField(pdfForm, page, helvetica, 'altura', form.altura);

  fillFormField(pdfForm, LME_FIELDS.DIAGNOSIS, form.cid_diagnostico);
  fillFormField(pdfForm, LME_FIELDS.ANAMNESE, form.anamnese, { fontSize: 6 });
  fillFormField(pdfForm, LME_FIELDS.TREATMENTS, form.tratamentoPrevio, { fontSize: 6 });

  if (selectedMedico) {
    fillFormField(pdfForm, LME_FIELDS.DOCTOR.NAME, selectedMedico.nomeCompleto);
    fillFormField(pdfForm, LME_FIELDS.DOCTOR.CNS, selectedMedico.cns);
    fillFormField(pdfForm, LME_FIELDS.DOCTOR.CPF, selectedMedico.cpf);
    fillFormField(pdfForm, LME_FIELDS.DOCTOR.CRM, selectedMedico.crm);
  }

  fillMedications(pdfForm, page, helvetica, form.medicamentos);
  pdfForm.updateFieldAppearances(helvetica);
  
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * Ferramenta de suporte para mapear campos do template
 */
export async function debugLmeFields() {
  try {
    const pdfDoc = await loadTemplate('assets/lme-template.pdf');
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
    savePdfFile(pdfBytes, 'LME_DEBUG_FIELDS.pdf');
  } catch (e) {
    console.error('Erro no debug:', e);
  }
}

