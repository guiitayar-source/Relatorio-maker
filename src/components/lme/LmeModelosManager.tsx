import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, FolderOpen, Trash2, BookmarkPlus, ChevronDown, ChevronUp } from 'lucide-react';
import type { LmeModelo } from '@/types';

interface LmeModelosManagerProps {
  modelos: LmeModelo[];
  onSalvar: (nome: string) => void;
  onCarregar: (id: string) => void;
  onExcluir: (id: string) => void;
}

export function LmeModelosManager({ modelos, onSalvar, onCarregar, onExcluir }: LmeModelosManagerProps) {
  const [nomeModelo, setNomeModelo] = useState('');
  const [expandido, setExpandido] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSalvar = () => {
    const nome = nomeModelo.trim();
    if (!nome) return;
    onSalvar(nome);
    setNomeModelo('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSalvar();
  };

  const handleExcluir = (id: string) => {
    if (confirmDeleteId === id) {
      onExcluir(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader
        className="cursor-pointer select-none hover:bg-muted/40 transition-colors rounded-t-xl"
        onClick={() => setExpandido(!expandido)}
      >
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <BookmarkPlus className="h-4 w-4" />
            Modelos Salvos ({modelos.length})
          </span>
          {expandido ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>

      {expandido && (
        <CardContent className="p-4 pt-0 space-y-4 animate-fade-in">
          {/* Salvar novo modelo */}
          <div className="flex gap-2">
            <Input
              id="lme-modelo-nome"
              placeholder="Nome do modelo (ex: Insulina Glargina)"
              value={nomeModelo}
              onChange={(e) => setNomeModelo(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button
              onClick={handleSalvar}
              disabled={!nomeModelo.trim()}
              size="sm"
              className="gap-1.5 shrink-0"
            >
              <Save className="h-3.5 w-3.5" />
              Salvar Atual
            </Button>
          </div>

          {/* Lista de modelos */}
          {modelos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum modelo salvo ainda. Preencha o formulário e clique em "Salvar Atual".
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {modelos.map((modelo) => (
                <div
                  key={modelo.id}
                  className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{modelo.nome}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(modelo.criadoEm).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {modelo.dados.cid_diagnostico && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                          {modelo.dados.cid_diagnostico.split(' - ')[0]}
                        </span>
                      )}
                      {modelo.dados.medicamentos[0]?.nome && (
                        <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-700">
                          {modelo.dados.medicamentos[0].nome.length > 25
                            ? modelo.dados.medicamentos[0].nome.substring(0, 25) + '…'
                            : modelo.dados.medicamentos[0].nome}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCarregar(modelo.id)}
                      className="gap-1 text-xs h-7"
                    >
                      <FolderOpen className="h-3 w-3" />
                      Carregar
                    </Button>
                    <Button
                      variant={confirmDeleteId === modelo.id ? 'destructive' : 'ghost'}
                      size="sm"
                      onClick={() => handleExcluir(modelo.id)}
                      className="h-7 w-7 p-0"
                      title={confirmDeleteId === modelo.id ? 'Clique novamente para confirmar' : 'Excluir'}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
