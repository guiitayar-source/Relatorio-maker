/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    platform: string;
    saveFile: (buffer: ArrayBuffer, fileName: string) => Promise<boolean>;
    googleLogin: () => Promise<any>;
  };
}
