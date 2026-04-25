import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CidAutocomplete } from '@/components/CidAutocomplete';
import type { LMEData } from '@/types';

interface ClinicalInfoFieldsProps {
  form: LMEData;
  updateField: <K extends keyof LMEData>(key: K, value: LMEData[K]) => void;
  handleCidChange: (value: string) => void;
}

export function ClinicalInfoFields({ form, updateField, handleCidChange }: ClinicalInfoFieldsProps) {
  return (
    <div className="space-y-6">
      {/* CID-10 e Diagnóstico */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Diagnóstico e CID-10
        </h3>
        <div className="space-y-2">
          <Label htmlFor="lme-cid">Busca por CID ou Nome</Label>
          <CidAutocomplete
            id="lme-cid"
            value={form.cid_diagnostico}
            onChange={handleCidChange}
          />
          <p className="text-xs text-muted-foreground">
            O campo acima aceita busca automática e edição manual para o PDF.
          </p>
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
    </div>
  );
}
