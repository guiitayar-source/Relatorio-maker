import { useState } from 'react';
import type { ModeloRelatorio, RelatorioData } from '@/types';
import { initialRelatorio } from '@/data/defaults';
import { useLocalStorage } from './useLocalStorage';
import { MODELOS_INICIAIS } from '@/data/mock-data';

export function useRelatorioForm() {
  const [modelos, setModelos] = useLocalStorage<ModeloRelatorio[]>('meddoc-modelos', MODELOS_INICIAIS);
  const [form, setForm] = useState<RelatorioData>(initialRelatorio());
  const [selectedModeloId, setSelectedModeloId] = useState('');
  const [novoModeloNome, setNovoModeloNome] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  function updateField<K extends keyof RelatorioData>(key: K, value: RelatorioData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCidChange(codigo: string, diagnostico: string) {
    setForm((prev) => ({ ...prev, cid10: codigo, diagnostico }));
  }

  function handleModeloSelect(modeloId: string) {
    setSelectedModeloId(modeloId);
    const modelo = modelos.find((m) => m.id === modeloId);
    if (modelo) {
      setForm((prev) => ({ ...prev, conteudo: modelo.conteudo }));
    }
  }

  function handleSaveModelo() {
    if (!novoModeloNome.trim()) return;
    const newModelo: ModeloRelatorio = {
      id: `modelo-${Date.now()}`,
      nome: novoModeloNome.trim(),
      conteudo: form.conteudo,
    };
    setModelos((prev) => [...prev, newModelo]);
    setNovoModeloNome('');
    setShowSaveModal(false);
    setSelectedModeloId(newModelo.id);
  }

  return {
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
  };
}
