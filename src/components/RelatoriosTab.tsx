import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CidAutocomplete } from '@/components/CidAutocomplete';
import type { Medico, ModeloRelatorio, RelatorioData } from '@/types';
import { MODELOS_INICIAIS } from '@/data/mock-data';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { FileText, Download, Save, BookOpen } from 'lucide-react';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

interface RelatoriosTabProps {
  medicos: Medico[];
}

export function RelatoriosTab({ medicos }: RelatoriosTabProps) {
  const [modelos, setModelos] = useLocalStorage<ModeloRelatorio[]>('meddoc-modelos', MODELOS_INICIAIS);
  const [form, setForm] = useState<RelatorioData>({
    paciente: '',
    dataNascimento: '',
    dataLaudo: new Date().toISOString().split('T')[0],
    cid10: '',
    diagnostico: '',
    conteudo: '',
    medicoId: '',
  });
  const [selectedModeloId, setSelectedModeloId] = useState('');
  const [novoModeloNome, setNovoModeloNome] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  function updateField<K extends keyof RelatorioData>(key: K, value: RelatorioData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCidChange(codigo: string, diagnostico: string) {
    setForm((prev) => ({ ...prev, cid10: codigo, diagnostico }));
  }

  function handleModeloSelect(modeloId: string) {
    setSelectedModeloId(modeloId);
    const modelo = modelos.find((m) => m.id === modeloId);
    if (modelo) {
      setForm((prev) => ({ ...prev, conteudo: modelo.conteudo }));
    }
  }

  function handleSaveModelo() {
    if (!novoModeloNome.trim()) return;
    const newModelo: ModeloRelatorio = {
      id: `modelo-${Date.now()}`,
      nome: novoModeloNome.trim(),
      conteudo: form.conteudo,
    };
    setModelos((prev) => [...prev, newModelo]);
    setNovoModeloNome('');
    setShowSaveModal(false);
    setSelectedModeloId(newModelo.id);
  }

  const selectedMedico = medicos.find((m) => m.id === form.medicoId);

  function exportToPdf() {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 25;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO MÉDICO', pageWidth / 2, y, { align: 'center' });
    y += 12;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const addField = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}: `, margin, y);
      const labelWidth = doc.getTextWidth(`${label}: `);
      doc.setFont('helvetica', 'normal');
      doc.text(value || '___', margin + labelWidth, y);
      y += 7;
    };

    addField('Paciente', form.paciente);
    addField('Data de Nascimento', form.dataNascimento ? new Date(form.dataNascimento + 'T12:00:00').toLocaleDateString('pt-BR') : '');
    addField('Data do Laudo', form.dataLaudo ? new Date(form.dataLaudo + 'T12:00:00').toLocaleDateString('pt-BR') : '');
    addField('CID-10', form.cid10 ? `${form.cid10} - ${form.diagnostico}` : '');
    y += 4;

    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(form.conteudo || '', contentWidth);
    lines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 5;
    });

    y += 10;
    if (selectedMedico) {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text('_________________________________', pageWidth / 2, y, { align: 'center' });
      y += 6;
      doc.text(selectedMedico.nomeCompleto, pageWidth / 2, y, { align: 'center' });
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(`CRM: ${selectedMedico.crm}`, pageWidth / 2, y, { align: 'center' });
    }

    const sanitizeFilename = (name: string) => {
      return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '_');
    };

    const fileName = `Relatorio_${sanitizeFilename(form.paciente || 'documento')}.pdf`;
    doc.save(fileName);
  }

  async function exportToDocx() {
    const sections = [];

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

    // Split content by lines
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

    sections.push({ children });

    const docFile = new Document({ sections });
    const blob = await Packer.toBlob(docFile);
    saveAs(blob, `Relatorio_${form.paciente || 'documento'}.docx`);
  }

  return (
    <div className="animate-fade-in">
      <Card className="border-0 shadow-lg">
        <CardHeader className="gradient-header rounded-t-xl">
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Relatórios e Laudos Médicos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x">
            {/* Left side - Metadata */}
            <div className="lg:col-span-2 p-6 space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Dados do Relatório
              </h3>

              <div className="space-y-2">
                <Label htmlFor="rel-paciente">Paciente</Label>
                <Input
                  id="rel-paciente"
                  value={form.paciente}
                  onChange={(e) => updateField('paciente', e.target.value)}
                  placeholder="Nome do paciente"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rel-nascimento">Data de Nascimento</Label>
                <Input
                  id="rel-nascimento"
                  type="date"
                  value={form.dataNascimento}
                  onChange={(e) => updateField('dataNascimento', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rel-data-laudo">Data do Laudo</Label>
                <Input
                  id="rel-data-laudo"
                  type="date"
                  value={form.dataLaudo}
                  onChange={(e) => updateField('dataLaudo', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>CID-10</Label>
                <CidAutocomplete
                  value={form.cid10 ? `${form.cid10} - ${form.diagnostico}` : ''}
                  onChange={handleCidChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rel-medico">Médico Responsável</Label>
                {medicos.length === 0 ? (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 text-center">
                    Cadastre médicos na aba "Cadastro de Médicos"
                  </p>
                ) : (
                  <select
                    id="rel-medico"
                    value={form.medicoId}
                    onChange={(e) => updateField('medicoId', e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary cursor-pointer"
                  >
                    <option value="">-- Selecionar --</option>
                    {medicos.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nomeCompleto} — CRM {m.crm}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-4 border-t space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Modelos
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="rel-modelo">Carregar Modelo</Label>
                  <select
                    id="rel-modelo"
                    value={selectedModeloId}
                    onChange={(e) => handleModeloSelect(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary cursor-pointer"
                  >
                    <option value="">-- Selecionar Modelo --</option>
                    {modelos.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => setShowSaveModal(true)}>
                  <Save className="h-4 w-4" />
                  Salvar como Novo Modelo
                </Button>
              </div>
            </div>

            {/* Right side - Editor */}
            <div className="lg:col-span-3 p-6 flex flex-col">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Conteúdo do Relatório
              </h3>
              <Textarea
                value={form.conteudo}
                onChange={(e) => updateField('conteudo', e.target.value)}
                placeholder="Digite o conteúdo do relatório aqui ou selecione um modelo..."
                className="flex-1 min-h-[400px] text-sm leading-relaxed font-mono"
              />

              <div className="flex flex-wrap gap-3 pt-4 mt-4 border-t">
                <Button onClick={exportToPdf} className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar PDF
                </Button>
                <Button variant="outline" onClick={exportToDocx} className="gap-2">
                  <FileText className="h-4 w-4" />
                  Exportar DOCX
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Model Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md border-0 shadow-2xl">
            <CardHeader>
              <CardTitle>Salvar Novo Modelo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modelo-nome">Nome do Modelo</Label>
                <Input
                  id="modelo-nome"
                  value={novoModeloNome}
                  onChange={(e) => setNovoModeloNome(e.target.value)}
                  placeholder="Ex: Relatório de Clozapina"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveModelo()}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowSaveModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveModelo} disabled={!novoModeloNome.trim()}>
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
