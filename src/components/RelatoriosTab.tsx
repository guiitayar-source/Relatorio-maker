import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CidAutocomplete } from '@/components/CidAutocomplete';
import { MedicoSelector } from '@/components/MedicoSelector';
import type { Medico } from '@/types';
import { useRelatorioForm } from '@/hooks/useRelatorioForm';
import { exportRelatorioToPdf, generateRelatorioPdfBlob, sanitizeFilename } from '@/lib/pdf-utils';
import { exportRelatorioToDocx, generateRelatorioDocxBlob } from '@/lib/docx-utils';
import { Save, BookOpen, Download, FileText, Cloud } from 'lucide-react';
import type { GoogleDriveService } from '@/lib/google-utils';

interface RelatoriosTabProps {
  medicos: Medico[];
  driveService?: GoogleDriveService | null;
}

export function RelatoriosTab({ medicos, driveService }: RelatoriosTabProps) {
  const {
    form,
    modelos,
    selectedModeloId,
    novoModeloNome,
    setNovoModeloNome,
    showSaveModal,
    setShowSaveModal,
    updateField,
    handleCidChange,
    handleModeloSelect,
    handleSaveModelo,
  } = useRelatorioForm();

  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isUploadingDocx, setIsUploadingDocx] = useState(false);
  const [isUploadingBackup, setIsUploadingBackup] = useState(false);

  const selectedMedico = medicos.find((m) => m.id === form.medicoSolicitanteId);

  const handleBackupToDrive = async () => {
    if (!driveService) return alert('Conecte-se ao Google Drive primeiro!');
    setIsUploadingBackup(true);
    try {
      const jsonStr = JSON.stringify(modelos, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const fileName = `relatorios_modelos_backup_${new Date().toISOString().split('T')[0]}.json`;
      const folderId = await driveService.getOrCreateFolder('relatorios DC');
      await driveService.uploadFile(blob, fileName, 'application/json', folderId);
      alert('Backup de Modelos de Relatórios salvo no Drive com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar modelos no Drive.');
    } finally {
      setIsUploadingBackup(false);
    }
  };

  const handleSavePdfToDrive = async () => {
    if (!driveService) return alert('Conecte-se ao Google Drive primeiro!');
    setIsUploadingPdf(true);
    try {
      const blob = await generateRelatorioPdfBlob(form, selectedMedico);
      const fileName = `Relatorio_${sanitizeFilename(form.paciente || 'documento')}.pdf`;
      const folderId = await driveService.getOrCreateFolder('relatorios DC');
      await driveService.uploadFile(blob, fileName, 'application/pdf', folderId);
      alert('Relatório PDF salvo no Google Drive com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar PDF no Drive.');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleSaveDocxToDrive = async () => {
    if (!driveService) return alert('Conecte-se ao Google Drive primeiro!');
    setIsUploadingDocx(true);
    try {
      const blob = await generateRelatorioDocxBlob(form, selectedMedico);
      const fileName = `Relatorio_${sanitizeFilename(form.paciente || 'documento')}.docx`;
      const folderId = await driveService.getOrCreateFolder('relatorios DC');
      await driveService.uploadFile(blob, fileName, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', folderId);
      alert('Relatório DOCX salvo no Google Drive com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar DOCX no Drive.');
    } finally {
      setIsUploadingDocx(false);
    }
  };

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
                  value={form.cid_diagnostico}
                  onChange={handleCidChange}
                />
              </div>

              <MedicoSelector
                id="rel-medico"
                medicos={medicos}
                selectedId={form.medicoSolicitanteId}
                onChange={(id) => updateField('medicoSolicitanteId', id)}
                label="Médico Responsável"
              />

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
                <div className="flex gap-2 w-full">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowSaveModal(true)}>
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                  {driveService && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleBackupToDrive} 
                      disabled={isUploadingBackup || modelos.length === 0}
                      className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Cloud className="h-4 w-4" />
                      Backup JSON
                    </Button>
                  )}
                </div>
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
                <Button onClick={() => exportRelatorioToPdf(form, selectedMedico)} className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar PDF
                </Button>
                {driveService && (
                  <Button 
                    variant="outline" 
                    onClick={handleSavePdfToDrive} 
                    disabled={isUploadingPdf}
                    className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Cloud className="h-4 w-4" />
                    {isUploadingPdf ? 'Salvando...' : 'Drive PDF'}
                  </Button>
                )}
                <Button variant="outline" onClick={() => exportRelatorioToDocx(form, selectedMedico)} className="gap-2">
                  <FileText className="h-4 w-4" />
                  Exportar DOCX
                </Button>
                {driveService && (
                  <Button 
                    variant="outline" 
                    onClick={handleSaveDocxToDrive} 
                    disabled={isUploadingDocx}
                    className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Cloud className="h-4 w-4" />
                    {isUploadingDocx ? 'Salvando...' : 'Drive DOCX'}
                  </Button>
                )}
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
