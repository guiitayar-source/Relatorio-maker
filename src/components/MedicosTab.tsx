import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { Medico } from '@/types';
import { UserPlus, Pencil, Trash2, Users, X, Check, Stethoscope } from 'lucide-react';

interface MedicosTabProps {
  medicos: Medico[];
  setMedicos: (value: Medico[] | ((prev: Medico[]) => Medico[])) => void;
}

const emptyMedico = (): Omit<Medico, 'id'> => ({
  nomeCompleto: '',
  crm: '',
  cns: '',
  cpf: '',
});

export function MedicosTab({ medicos, setMedicos }: MedicosTabProps) {
  const [formData, setFormData] = useState(emptyMedico());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  function updateField(field: keyof Omit<Medico, 'id'>, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function formatCPF(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  function handleSave() {
    if (!formData.nomeCompleto.trim() || !formData.crm.trim()) return;

    if (editingId) {
      setMedicos((prev: Medico[]) =>
        prev.map((m) => (m.id === editingId ? { ...m, ...formData } : m))
      );
    } else {
      const newMedico: Medico = {
        id: `med-${Date.now()}`,
        ...formData,
      };
      setMedicos((prev: Medico[]) => [...prev, newMedico]);
    }

    resetForm();
  }

  function handleEdit(medico: Medico) {
    setFormData({
      nomeCompleto: medico.nomeCompleto,
      crm: medico.crm,
      cns: medico.cns,
      cpf: medico.cpf,
    });
    setEditingId(medico.id);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    setMedicos((prev: Medico[]) => prev.filter((m) => m.id !== id));
    if (editingId === id) resetForm();
  }

  function resetForm() {
    setFormData(emptyMedico());
    setEditingId(null);
    setShowForm(false);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-0 shadow-lg">
        <CardHeader className="gradient-header rounded-t-xl">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Cadastro de Médicos
            </CardTitle>
            {!showForm && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowForm(true)}
                className="gap-1"
              >
                <UserPlus className="h-4 w-4" />
                Novo Médico
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Form */}
          {showForm && (
            <div className="mb-6 rounded-xl border bg-muted/30 p-6 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {editingId ? 'Editar Médico' : 'Novo Médico'}
                </h3>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="med-nome">Nome Completo *</Label>
                  <Input
                    id="med-nome"
                    value={formData.nomeCompleto}
                    onChange={(e) => updateField('nomeCompleto', e.target.value)}
                    placeholder="Dr(a). Nome Completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="med-crm">CRM *</Label>
                  <Input
                    id="med-crm"
                    value={formData.crm}
                    onChange={(e) => updateField('crm', e.target.value)}
                    placeholder="CRM/UF 00000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="med-cns">CNS (Cartão Nacional de Saúde)</Label>
                  <Input
                    id="med-cns"
                    value={formData.cns}
                    onChange={(e) => updateField('cns', e.target.value)}
                    placeholder="000 0000 0000 0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="med-cpf">CPF</Label>
                  <Input
                    id="med-cpf"
                    value={formData.cpf}
                    onChange={(e) => updateField('cpf', formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={!formData.nomeCompleto.trim() || !formData.crm.trim()}>
                  <Check className="h-4 w-4" />
                  {editingId ? 'Atualizar' : 'Cadastrar'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Doctors list */}
          {medicos.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Stethoscope className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                Nenhum médico cadastrado ainda.
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Clique em "Novo Médico" para começar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {medicos.map((medico) => (
                <div
                  key={medico.id}
                  className="group relative rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shrink-0">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{medico.nomeCompleto}</h4>
                      <p className="text-xs text-muted-foreground mt-1">CRM: {medico.crm}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                    {medico.cns && (
                      <span className="inline-flex items-center text-xs bg-muted px-2 py-1 rounded-md">
                        CNS: {medico.cns}
                      </span>
                    )}
                    {medico.cpf && (
                      <span className="inline-flex items-center text-xs bg-muted px-2 py-1 rounded-md">
                        CPF: {medico.cpf}
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(medico)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(medico.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
