import { useState, useCallback } from 'react';
import type { LMEData, Medicamento, LmeModelo } from '@/types';
import { initialLME, emptyMedicamento } from '@/data/defaults';
import { useLocalStorage } from './useLocalStorage';

export function useLmeForm() {
  const [form, setForm] = useState<LMEData>(initialLME);
  const [modelos, setModelos] = useLocalStorage<LmeModelo[]>('meddoc-lme-modelos', []);

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

  function handleCidChange(value: string) {
    setForm((prev) => ({ ...prev, cid_diagnostico: value }));
  }

  function resetForm() {
    setForm(initialLME);
  }

  // --- Modelos (Templates) ---

  const salvarModelo = useCallback((nome: string) => {
    const novoModelo: LmeModelo = {
      id: crypto.randomUUID(),
      nome,
      criadoEm: new Date().toISOString(),
      dados: { ...form },
    };
    setModelos((prev) => [...prev, novoModelo]);
  }, [form, setModelos]);

  const carregarModelo = useCallback((id: string) => {
    const modelo = modelos.find((m) => m.id === id);
    if (modelo) {
      setForm({ ...modelo.dados });
    }
  }, [modelos]);

  const excluirModelo = useCallback((id: string) => {
    setModelos((prev) => prev.filter((m) => m.id !== id));
  }, [setModelos]);

  return {
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
  };
}
