import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MedicoSelector } from '@/components/MedicoSelector';
import { PatientDataFields } from './lme/PatientDataFields';
import { MedicamentosFields } from './lme/MedicamentosFields';
import { ClinicalInfoFields } from './lme/ClinicalInfoFields';
import { PdfPreview } from './lme/PdfPreview';
import { LmeModelosManager } from './lme/LmeModelosManager';
import type { Medico } from '@/types';
import { FileText, Download, Cloud } from 'lucide-react';
import { useLmeForm } from '@/hooks/useLmeForm';
import { exportLmeToPdf, debugLmeFields, generateLmePdfBlob } from '@/lib/pdf-utils';
import { sanitizeFilename } from '@/lib/pdf-utils';
import type { GoogleDriveService } from '@/lib/google-utils';

interface LmeTabProps {
  medicos: Medico[];
  driveService?: GoogleDriveService | null;
}

export function LmeTab({ medicos, driveService }: LmeTabProps) {
  const {
    form,
    updateField,
    updateMedicamento,
    addMedicamento,
    removeMedicamento,
    handleCidChange,
    resetForm,
    modelos,
    salvarModelo,
    carregarModelo,
    excluirModelo,
  } = useLmeForm();

  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const selectedMedico = medicos.find((m) => m.id === form.medicoSolicitanteId);

  const handleSavePdfToDrive = async () => {
    if (!driveService) return alert('Conecte-se ao Google Drive primeiro!');
    setIsUploadingPdf(true);
    try {
      const blob = await generateLmePdfBlob(form, selectedMedico);
      const fileName = `LME_${sanitizeFilename(form.nomePaciente || 'documento')}.pdf`;
      const folderId = await driveService.getOrCreateFolder('relatorios DC');
      await driveService.uploadFile(blob, fileName, 'application/pdf', folderId);
      alert('LME PDF salvo no Google Drive com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar no Drive.');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Modelos Salvos */}
      <LmeModelosManager
        modelos={modelos}
        onSalvar={salvarModelo}
        onCarregar={carregarModelo}
        onExcluir={excluirModelo}
        driveService={driveService}
      />

      <Card className="border-0 shadow-lg">
        <CardHeader className="gradient-header rounded-t-xl">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            LME - Laudo para Solicitação de Medicamento Especializado
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <PatientDataFields form={form} updateField={updateField} />
          
          <MedicamentosFields
            medicamentos={form.medicamentos}
            updateMedicamento={updateMedicamento}
            addMedicamento={addMedicamento}
            removeMedicamento={removeMedicamento}
          />

          <ClinicalInfoFields
            form={form}
            updateField={updateField}
            handleCidChange={handleCidChange}
          />

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Médico Solicitante
            </h3>
            <MedicoSelector
              id="lme-medico"
              medicos={medicos}
              selectedId={form.medicoSolicitanteId}
              onChange={(id) => updateField('medicoSolicitanteId', id)}
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button onClick={() => exportLmeToPdf(form, selectedMedico)} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar para PDF
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
            <Button variant="outline" onClick={() => setShowPdfPreview(!showPdfPreview)}>
              <FileText className="h-4 w-4" />
              {showPdfPreview ? 'Ocultar' : 'Pré-visualizar'}
            </Button>
            <Button variant="secondary" onClick={resetForm}>
              Limpar Formulário
            </Button>
            <Button variant="ghost" size="sm" onClick={debugLmeFields} className="text-muted-foreground text-xs hover:text-primary">
              Mapear Campos (Suporte)
            </Button>
          </div>
        </CardContent>
      </Card>

      {showPdfPreview && (
        <PdfPreview form={form} selectedMedico={selectedMedico} />
      )}
    </div>
  );
}
