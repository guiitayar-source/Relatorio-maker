import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  ImageRun, 
  AlignmentType, 
  Header, 
  Footer, 
  Table, 
  TableRow, 
  TableCell, 
  BorderStyle, 
  WidthType,
  VerticalAlign
} from 'docx';
import { saveAs } from 'file-saver';
import type { Medico, RelatorioData } from '@/types';
import { sanitizeFilename } from './pdf-utils';
import { CLINIC_INFO, DOCUMENT_TITLES } from './constants';

async function getImageData(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image: ${url}`);
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

function createReportHeader(logo1: Uint8Array, logo2: Uint8Array): Header {
  return new Header({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new ImageRun({
                        data: logo1,
                        type: 'png',
                        transformation: { width: 220, height: 40 },
                      }),
                    ],
                  }),
                ],
                width: { size: 20, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: CLINIC_INFO.NAME,
                        size: 36, // 18pt
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                width: { size: 60, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new ImageRun({
                        data: logo2,
                        type: 'png',
                        transformation: { width: 130, height: 90 },
                      }),
                    ],
                    alignment: AlignmentType.RIGHT,
                  }),
                ],
                width: { size: 20, type: WidthType.PERCENTAGE },
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createReportFooter(): Footer {
  return new Footer({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: 'Assinatura/Carimbo',
                        font: 'Garamond',
                        size: 22, // 11pt
                      }),
                    ],
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 100 },
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: CLINIC_INFO.ADDRESS,
            size: 28, // 14pt
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: CLINIC_INFO.PHONE,
            size: 32, // 16pt
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
    ],
  });
}

export async function exportRelatorioToDocx(form: RelatorioData, selectedMedico?: Medico) {
  console.log('Iniciando exportação Relatório para DOCX...', { form, selectedMedico });
  try {
    const [logo1, logo2] = await Promise.all([
      getImageData(CLINIC_INFO.LOGOS.PRIMARY),
      getImageData(CLINIC_INFO.LOGOS.SECONDARY)
    ]);

    const children = [
      new Paragraph({
        text: DOCUMENT_TITLES.RELATORIO_MEDICO,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 600 },
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
          new TextRun(form.cid_diagnostico || '___'),
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
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    });

    if (selectedMedico) {
      children.push(
        new Paragraph({ text: '', spacing: { before: 600 } }),
        new Paragraph({
          text: '_________________________________',
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [new TextRun({ text: selectedMedico.nomeCompleto, bold: true })],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: `CRM: ${selectedMedico.crm}`,
          alignment: AlignmentType.CENTER,
        })
      );
    }

    const docFile = new Document({
      sections: [
        {
          headers: { default: createReportHeader(logo1, logo2) },
          footers: { default: createReportFooter() },
          children,
        },
      ],
    });

    const blob = await Packer.toBlob(docFile);
    const fileName = `Relatorio_${sanitizeFilename(form.paciente || 'documento')}.docx`;
    
    if (window.electronAPI && window.electronAPI.saveFile) {
      const buffer = await blob.arrayBuffer();
      const success = await window.electronAPI.saveFile(buffer, fileName);
      if (!success) {
        console.log('Salvamento DOCX cancelado ou falhou.');
      }
    } else {
      saveAs(blob, fileName);
    }
    console.log('Exportação Relatório DOCX concluída com sucesso.');
  } catch (error) {
    console.error('Erro ao gerar DOCX do Relatório:', error);
    alert('Erro ao gerar o DOCX do Relatório. Verifique o console para mais detalhes.');
  }
}

export async function generateRelatorioDocxBlob(form: RelatorioData, selectedMedico?: Medico): Promise<Blob> {
  const [logo1, logo2] = await Promise.all([
    getImageData(CLINIC_INFO.LOGOS.PRIMARY),
    getImageData(CLINIC_INFO.LOGOS.SECONDARY)
  ]);

  const children = [
    new Paragraph({
      text: DOCUMENT_TITLES.RELATORIO_MEDICO,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 600 },
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
        new TextRun(form.cid_diagnostico || '___'),
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
        alignment: AlignmentType.JUSTIFIED,
      })
    );
  });

  if (selectedMedico) {
    children.push(
      new Paragraph({ text: '', spacing: { before: 600 } }),
      new Paragraph({
        text: '_________________________________',
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        children: [new TextRun({ text: selectedMedico.nomeCompleto, bold: true })],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `CRM: ${selectedMedico.crm}`,
        alignment: AlignmentType.CENTER,
      })
    );
  }

  const docFile = new Document({
    sections: [
      {
        headers: { default: createReportHeader(logo1, logo2) },
        footers: { default: createReportFooter() },
        children,
      },
    ],
  });

  return await Packer.toBlob(docFile);
}
