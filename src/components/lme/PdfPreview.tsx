import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LMEData, Medico } from '@/types';

interface PdfPreviewProps {
  form: LMEData;
  selectedMedico?: Medico;
}

export function PdfPreview({ form, selectedMedico }: PdfPreviewProps) {
  return (
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
  );
}
