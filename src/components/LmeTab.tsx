import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CidAutocomplete } from '@/components/CidAutocomplete';
import type { Medico, LMEData, Medicamento } from '@/types';
import { FileText, Plus, Trash2, Download } from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface LmeTabProps {
  medicos: Medico[];
}

const emptyMedicamento = (): Medicamento => ({
  nome: '',
  quantidade: ['', '', '', '', '', ''],
});

const initialLME: LMEData = {
  cnes: '',
  nomePaciente: '',
  peso: '',
  altura: '',
  nomeMae: '',
  medicamentos: [emptyMedicamento()],
  cid10: '',
  diagnostico: '',
  anamnese: '',
  tratamentoPrevio: '',
  capacidade: '',
  medicoSolicitanteId: '',
};

export function LmeTab({ medicos }: LmeTabProps) {
  const [form, setForm] = useState<LMEData>(initialLME);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  function updateField<K extends keyof LMEData>(key: K, value: LMEData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateMedicamento(index: number, field: keyof Medicamento, value: string, mesIndex?: number) {
    setForm((prev) => {
      const newMeds = [...prev.medicamentos];
      if (field === 'nome') {
        newMeds[index] = { ...newMeds[index], nome: value };
      } else if (field === 'quantidade' && mesIndex !== undefined) {
        const newQtd = [...newMeds[index].quantidade] as Medicamento['quantidade'];
        newQtd[mesIndex] = value;
        newMeds[index] = { ...newMeds[index], quantidade: newQtd };
      }
      return { ...prev, medicamentos: newMeds };
    });
  }

  function addMedicamento() {
    setForm((prev) => ({
      ...prev,
      medicamentos: [...prev.medicamentos, emptyMedicamento()],
    }));
  }

  function removeMedicamento(index: number) {
    setForm((prev) => ({
      ...prev,
      medicamentos: prev.medicamentos.filter((_, i) => i !== index),
    }));
  }

  function handleCidChange(codigo: string, diagnostico: string) {
    setForm((prev) => ({ ...prev, cid10: codigo, diagnostico }));
  }

  const selectedMedico = medicos.find((m) => m.id === form.medicoSolicitanteId);

  async function exportToPdf() {
    try {
      const templateUrl = '/assets/lme-template.pdf';
      const templateBytes = await fetch(templateUrl).then((res) => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(templateBytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const page = pdfDoc.getPages()[0];
      const { width, height } = page.getSize();

      const drawText = (text: string, x: number, y: number, size = 10, isBold = false) => {
        if (!text) return;
        page.drawText(text, {
          x,
          y: height - y,
          size,
          font: isBold ? fontBold : font,
          color: rgb(0, 0, 0),
        });
      };

      // Coordinates (approximate, based on 595x842 standard A4)
      // Header
      drawText(form.cnes, 50, 182, 10);
      
      // Patient Data
      drawText(form.nomePaciente, 50, 240, 11);
      drawText(form.peso, 440, 240, 10);
      drawText(form.altura, 510, 240, 10);
      drawText(form.nomeMae, 50, 275, 10);

      // Medicamentos
      let medY = 368;
      form.medicamentos.slice(0, 5).forEach((med, idx) => {
        const yOffset = idx * 14.5; // Row height
        drawText(med.nome, 50, medY + yOffset, 8);
        med.quantidade.forEach((q, qIdx) => {
          drawText(q, 335 + qIdx * 42, medY + yOffset, 8);
        });
      });

      // Diagnosis
      drawText(form.cid10, 50, 480, 10);
      drawText(form.diagnostico, 140, 480, 9);

      // Clinical info
      const drawWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number, size = 9) => {
        if (!text) return 0;
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        for (const word of words) {
          const testLine = line + word + ' ';
          const width = font.widthOfTextAtSize(testLine, size);
          if (width > maxWidth && line !== '') {
            drawText(line, x, currentY, size);
            line = word + ' ';
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }
        drawText(line, x, currentY, size);
        return currentY;
      };

      drawWrappedText(form.anamnese, 50, 530, 500, 12);
      drawWrappedText(form.tratamentoPrevio, 50, 615, 500, 12);
      drawText(form.capacidade, 50, 685, 10);

      // Physician info
      if (selectedMedico) {
        drawText(selectedMedico.nomeCompleto, 50, 750, 10, true);
        drawText(`CRM: ${selectedMedico.crm}`, 50, 762, 9);
        drawText(`CNS: ${selectedMedico.cns}`, 150, 762, 9);
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const sanitizeFilename = (name: string) => {
        return name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '_');
      };
      link.download = `LME_${sanitizeFilename(form.nomePaciente || 'documento')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o PDF. Verifique se o template está acessível.');
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-0 shadow-lg">
        <CardHeader className="gradient-header rounded-t-xl">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            LME - Laudo para Solicitação de Medicamento Especializado
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Dados do Estabelecimento e Paciente */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Dados do Paciente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lme-cnes">CNES</Label>
                <Input id="lme-cnes" value={form.cnes} onChange={(e) => updateField('cnes', e.target.value)} placeholder="Código CNES" />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="lme-paciente">Nome do Paciente</Label>
                <Input id="lme-paciente" value={form.nomePaciente} onChange={(e) => updateField('nomePaciente', e.target.value)} placeholder="Nome completo" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="lme-peso">Peso (kg)</Label>
                  <Input id="lme-peso" value={form.peso} onChange={(e) => updateField('peso', e.target.value)} placeholder="kg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lme-altura">Altura (cm)</Label>
                  <Input id="lme-altura" value={form.altura} onChange={(e) => updateField('altura', e.target.value)} placeholder="cm" />
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="lme-mae">Nome da Mãe</Label>
              <Input id="lme-mae" value={form.nomeMae} onChange={(e) => updateField('nomeMae', e.target.value)} placeholder="Nome completo da mãe" />
            </div>
          </div>

          {/* Medicamentos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Medicamentos
              </h3>
              <Button variant="outline" size="sm" onClick={addMedicamento}>
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </div>
            <div className="space-y-3">
              {form.medicamentos.map((med, medIndex) => (
                <div key={medIndex} className="rounded-lg border bg-muted/30 p-4 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-2">
                      <Label>Nome do Medicamento</Label>
                      <Input
                        value={med.nome}
                        onChange={(e) => updateMedicamento(medIndex, 'nome', e.target.value)}
                        placeholder="Ex: Paliperidona Palmitato 150mg"
                      />
                    </div>
                    {form.medicamentos.length > 1 && (
                      <Button variant="ghost" size="icon" className="mt-6 text-destructive hover:text-destructive" onClick={() => removeMedicamento(medIndex)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {med.quantidade.map((q, mesIndex) => (
                      <div key={mesIndex} className="space-y-1">
                        <Label className="text-xs">{mesIndex + 1}º Mês</Label>
                        <Input
                          value={q}
                          onChange={(e) => updateMedicamento(medIndex, 'quantidade', e.target.value, mesIndex)}
                          placeholder="Qtd"
                          className="text-center"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CID-10 e Diagnóstico */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Diagnóstico
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lme-cid">CID-10</Label>
                <CidAutocomplete
                  id="lme-cid"
                  value={form.cid10 ? `${form.cid10} - ${form.diagnostico}` : ''}
                  onChange={handleCidChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lme-diagnostico">Diagnóstico</Label>
                <Input
                  id="lme-diagnostico"
                  value={form.diagnostico}
                  onChange={(e) => updateField('diagnostico', e.target.value)}
                  placeholder="Preenchido automaticamente pelo CID"
                />
              </div>
            </div>
          </div>

          {/* Anamnese, Tratamento e Capacidade */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Informações Clínicas
            </h3>
            <div className="space-y-2">
              <Label htmlFor="lme-anamnese">Anamnese</Label>
              <Textarea
                id="lme-anamnese"
                value={form.anamnese}
                onChange={(e) => updateField('anamnese', e.target.value)}
                placeholder="Descreva a história clínica, sintomas, evolução..."
                className="min-h-[150px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lme-tratamento">Tratamento Prévio</Label>
              <Textarea
                id="lme-tratamento"
                value={form.tratamentoPrevio}
                onChange={(e) => updateField('tratamentoPrevio', e.target.value)}
                placeholder="Medicamentos utilizados anteriormente, doses, duração e resposta..."
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lme-capacidade">Capacidade Funcional</Label>
              <Input
                id="lme-capacidade"
                value={form.capacidade}
                onChange={(e) => updateField('capacidade', e.target.value)}
                placeholder="Descrição da capacidade funcional do paciente"
              />
            </div>
          </div>

          {/* Médico Solicitante */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Médico Solicitante
            </h3>
            {medicos.length === 0 ? (
              <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 text-center">
                Nenhum médico cadastrado. Cadastre médicos na aba <strong>"Cadastro de Médicos"</strong>.
              </p>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="lme-medico">Selecione o Médico</Label>
                <select
                  id="lme-medico"
                  value={form.medicoSolicitanteId}
                  onChange={(e) => updateField('medicoSolicitanteId', e.target.value)}
                  className="flex h-10 w-full max-w-md rounded-lg border border-input bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary cursor-pointer"
                >
                  <option value="">-- Selecionar Médico --</option>
                  {medicos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nomeCompleto} — CRM {m.crm}
                    </option>
                  ))}
                </select>
                {selectedMedico && (
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="bg-muted px-2 py-1 rounded-md">CRM: {selectedMedico.crm}</span>
                    <span className="bg-muted px-2 py-1 rounded-md">CNS: {selectedMedico.cns}</span>
                    <span className="bg-muted px-2 py-1 rounded-md">CPF: {selectedMedico.cpf}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button onClick={exportToPdf} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar para PDF
            </Button>
            <Button variant="outline" onClick={() => setShowPdfPreview(!showPdfPreview)}>
              <FileText className="h-4 w-4" />
              {showPdfPreview ? 'Ocultar' : 'Pré-visualizar'}
            </Button>
            <Button variant="secondary" onClick={() => setForm(initialLME)}>
              Limpar Formulário
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PDF Preview */}
      {showPdfPreview && (
        <Card className="border-0 shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Pré-visualização do LME</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="pdf-preview max-w-2xl mx-auto p-8 rounded-lg text-sm leading-relaxed">
              <h2 className="text-center font-bold text-base mb-1">
                LAUDO PARA SOLICITAÇÃO / AUTORIZAÇÃO
              </h2>
              <h3 className="text-center font-bold text-sm mb-6">
                DE MEDICAMENTO DO COMPONENTE ESPECIALIZADO
              </h3>
              <div className="space-y-1 mb-4">
                <p><strong>CNES:</strong> {form.cnes || '___'}</p>
                <p><strong>Paciente:</strong> {form.nomePaciente || '___'}</p>
                <p><strong>Peso:</strong> {form.peso || '___'} kg &nbsp;&nbsp; <strong>Altura:</strong> {form.altura || '___'} cm</p>
                <p><strong>Nome da Mãe:</strong> {form.nomeMae || '___'}</p>
              </div>
              <table className="w-full border-collapse text-xs mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-1.5 text-left">Medicamento</th>
                    {[1, 2, 3, 4, 5, 6].map((m) => (
                      <th key={m} className="border p-1.5 text-center">{m}º Mês</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {form.medicamentos.map((med, i) => (
                    <tr key={i}>
                      <td className="border p-1.5">{med.nome || '-'}</td>
                      {med.quantidade.map((q, j) => (
                        <td key={j} className="border p-1.5 text-center">{q || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="space-y-1 mb-4">
                <p><strong>CID-10:</strong> {form.cid10 || '___'}</p>
                <p><strong>Diagnóstico:</strong> {form.diagnostico || '___'}</p>
              </div>
              <div className="mb-3">
                <p className="font-bold mb-1">Anamnese:</p>
                <p className="whitespace-pre-wrap">{form.anamnese || '___'}</p>
              </div>
              <div className="mb-3">
                <p className="font-bold mb-1">Tratamento Prévio:</p>
                <p className="whitespace-pre-wrap">{form.tratamentoPrevio || '___'}</p>
              </div>
              <p className="mb-4"><strong>Capacidade Funcional:</strong> {form.capacidade || '___'}</p>
              {selectedMedico && (
                <div className="border-t pt-4 mt-6 space-y-1">
                  <p><strong>Médico Solicitante:</strong> {selectedMedico.nomeCompleto}</p>
                  <p><strong>CRM:</strong> {selectedMedico.crm} &nbsp;&nbsp; <strong>CNS:</strong> {selectedMedico.cns}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
