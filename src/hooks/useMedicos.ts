import { useState } from 'react';
import type { Medico } from '@/types';
import { emptyMedico } from '@/data/defaults';

export function useMedicos(medicos: Medico[], setMedicos: (value: Medico[] | ((prev: Medico[]) => Medico[])) => void) {
  const [formData, setFormData] = useState(emptyMedico());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  function updateField(field: keyof Omit<Medico, 'id'>, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  return {
    formData,
    editingId,
    showForm,
    setShowForm,
    updateField,
    handleSave,
    handleEdit,
    handleDelete,
    resetForm,
  };
}
