import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LmeTab } from '@/components/LmeTab';
import { RelatoriosTab } from '@/components/RelatoriosTab';
import { MedicosTab } from '@/components/MedicosTab';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Medico } from '@/types';
import { FileText, BookOpen, Users, ShieldCheck, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GoogleDriveService } from '@/lib/google-utils';

function App() {
  const [activeTab, setActiveTab] = useState('lme');
  const [medicos, setMedicos] = useLocalStorage<Medico[]>('meddoc-medicos', []);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    if (window.electronAPI && window.electronAPI.googleLogin) {
      try {
        const tokenData = await window.electronAPI.googleLogin();
        if (tokenData && tokenData.access_token) {
          setGoogleToken(tokenData.access_token);
        }
      } catch (err) {
        console.error('Erro no login do Google:', err);
        alert('Erro ao conectar com Google Drive: ' + err);
      }
    } else {
      alert('Login do Google nativo não disponível no modo Web por enquanto.');
    }
  };

  const driveService = googleToken ? new GoogleDriveService(googleToken) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg gradient-header">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">
                  MedDoc
                </h1>
                <p className="text-[11px] text-muted-foreground -mt-0.5">
                  Automação de Documentos Médicos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {googleToken ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-blue-200">
                  <Cloud className="h-3.5 w-3.5" />
                  <span>Conectado ao Drive</span>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={handleGoogleLogin} className="gap-2 text-xs h-8">
                  <Cloud className="h-3.5 w-3.5" />
                  Conectar Drive
                </Button>
              )}
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Dados salvos localmente</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="lme" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">LME</span>
              <span className="sm:hidden">LME</span>
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Relatórios e Laudos</span>
              <span className="sm:hidden">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="medicos" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Cadastro de Médicos</span>
              <span className="sm:hidden">Médicos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lme">
            <LmeTab medicos={medicos} driveService={driveService} />
          </TabsContent>

          <TabsContent value="relatorios">
            <RelatoriosTab medicos={medicos} driveService={driveService} />
          </TabsContent>

          <TabsContent value="medicos">
            <MedicosTab medicos={medicos} setMedicos={setMedicos} driveService={driveService} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-xs text-muted-foreground">
            MedDoc — Todos os dados são armazenados exclusivamente no seu navegador (localStorage).
            Nenhuma informação é enviada para servidores externos, exceto seus arquivos exportados no Google Drive (se conectado).
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
