import React from 'react';
import { Label } from '@/components/ui/label';
import type { Medico } from '@/types';

interface MedicoSelectorProps {
  id: string;
  medicos: Medico[];
  selectedId: string;
  onChange: (id: string) => void;
  label?: string;
  helperText?: string;
}

export function MedicoSelector({
  id,
  medicos,
  selectedId,
  onChange,
  label = 'Selecione o Médico',
  helperText = 'Cadastre médicos na aba "Cadastro de Médicos"',
}: MedicoSelectorProps) {
  const selectedMedico = medicos.find((m) => m.id === selectedId);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {medicos.length === 0 ? (
        <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 text-center">
          {helperText}
        </p>
      ) : (
        <>
          <select
            id={id}
            value={selectedId}
            onChange={(e) => onChange(e.target.value)}
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
        </>
      )}
    </div>
  );
}
