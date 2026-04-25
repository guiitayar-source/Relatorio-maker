import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import type { Medico, RelatorioData } from '@/types';
import { sanitizeFilename } from './pdf-utils';

export async function exportRelatorioToDocx(form: RelatorioData, selectedMedico?: Medico) {
  console.log('Iniciando exportação Relatório para DOCX...', { form, selectedMedico });
  try {
    const children = [
      new Paragraph({
        text: 'RELATÓRIO MÉDICO',
        heading: HeadingLevel.HEADING_1,
        alignment: 'center' as const,
        spacing: { after: 300 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Paciente: ', bold: true }),
          new TextRun(form.paciente || '___'),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Data de Nascimento: ', bold: true }),
          new TextRun(form.dataNascimento ? new Date(form.dataNascimento + 'T12:00:00').toLocaleDateString('pt-BR') : '___'),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Data do Laudo: ', bold: true }),
          new TextRun(form.dataLaudo ? new Date(form.dataLaudo + 'T12:00:00').toLocaleDateString('pt-BR') : '___'),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'CID-10: ', bold: true }),
          new TextRun(form.cid10 ? `${form.cid10} - ${form.diagnostico}` : '___'),
        ],
        spacing: { after: 300 },
      }),
    ];

    const contentLines = (form.conteudo || '').split('\n');
    contentLines.forEach((line) => {
      children.push(
        new Paragraph({
          text: line,
          spacing: { after: 100 },
        })
      );
    });

    if (selectedMedico) {
      children.push(
        new Paragraph({ text: '', spacing: { before: 600 } }),
        new Paragraph({
          text: '_________________________________',
          alignment: 'center' as const,
        }),
        new Paragraph({
          children: [new TextRun({ text: selectedMedico.nomeCompleto, bold: true })],
          alignment: 'center' as const,
        }),
        new Paragraph({
          text: `CRM: ${selectedMedico.crm}`,
          alignment: 'center' as const,
        })
      );
    }

    const docFile = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(docFile);
    saveAs(blob, `Relatorio_${sanitizeFilename(form.paciente || 'documento')}.docx`);
    console.log('Exportação Relatório DOCX concluída com sucesso.');
  } catch (error) {
    console.error('Erro ao gerar DOCX do Relatório:', error);
    alert('Erro ao gerar o DOCX do Relatório. Verifique o console para mais detalhes.');
  }
}
