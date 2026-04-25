import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LMEData } from '@/types';

interface PatientDataFieldsProps {
  form: LMEData;
  updateField: <K extends keyof LMEData>(key: K, value: LMEData[K]) => void;
}

export function PatientDataFields({ form, updateField }: PatientDataFieldsProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Dados do Paciente
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="lme-estabelecimento">Nome do Estabelecimento</Label>
          <Input id="lme-estabelecimento" value={form.estabelecimento} onChange={(e) => updateField('estabelecimento', e.target.value)} placeholder="Unidade de Saúde" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lme-cnes">CNES</Label>
          <Input id="lme-cnes" value={form.cnes} onChange={(e) => updateField('cnes', e.target.value)} placeholder="Código CNES" />
        </div>
        <div className="space-y-2">
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
  );
}
