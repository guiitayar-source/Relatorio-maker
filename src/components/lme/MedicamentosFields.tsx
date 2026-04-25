import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import type { LMEData, Medicamento } from '@/types';

interface MedicamentosFieldsProps {
  medicamentos: Medicamento[];
  updateMedicamento: (index: number, field: keyof Medicamento, value: string, mesIndex?: number) => void;
  addMedicamento: () => void;
  removeMedicamento: (index: number) => void;
}

export function MedicamentosFields({
  medicamentos,
  updateMedicamento,
  addMedicamento,
  removeMedicamento,
}: MedicamentosFieldsProps) {
  return (
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
        {medicamentos.map((med, medIndex) => (
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
              {medicamentos.length > 1 && (
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
  );
}
