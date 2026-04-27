const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const isDev = process.env.NODE_ENV === 'development';

function loadCredentials() {
  const searchPaths = [
    path.join(__dirname, '..'), // Raiz do projeto em dev ou raiz do ASAR
    process.resourcesPath,      // Pasta resources no instalador
    app.getAppPath(),           // Caminho base do app
  ];

  for (const basePath of searchPaths) {
    // 1. Tentar .env.local
    const envPath = path.join(basePath, '.env.local');
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split(/\r?\n/).forEach(line => {
          const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
          if (match) {
            let key = match[1];
            let value = (match[2] || '').trim();
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value && !process.env[key]) process.env[key] = value;
          }
        });
      } catch (e) { console.error('Erro ao ler .env.local:', e); }
    }

    // 2. Tentar google-credentials.json ou chavegoogleapppc.json
    const jsonFiles = ['google-credentials.json', 'chavegoogleapppc.json'];
    for (const fileName of jsonFiles) {
      const jsonPath = path.join(basePath, fileName);
      if (fs.existsSync(jsonPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
          const credentials = data.web || data.installed;
          if (credentials) {
            if (!process.env.VITE_GOOGLE_CLIENT_ID) process.env.VITE_GOOGLE_CLIENT_ID = credentials.client_id;
            if (!process.env.VITE_GOOGLE_CLIENT_SECRET) process.env.VITE_GOOGLE_CLIENT_SECRET = credentials.client_secret;
          }
        } catch (e) { console.error(`Erro ao ler ${fileName}:`, e); }
      }
    }
  }
}
loadCredentials();

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/assets/template-logo-2.png')
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  win.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('save-file', async (event, buffer, defaultPath) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        defaultPath: defaultPath,
      });
      if (canceled || !filePath) return false;
      fs.writeFileSync(filePath, Buffer.from(buffer));
      return true;
    } catch (err) {
      console.error('Erro ao salvar arquivo via IPC:', err);
      return false;
    }
  });

  ipcMain.handle('google-login', async () => {
    return new Promise((resolve, reject) => {
      const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
      const clientSecret = process.env.VITE_GOOGLE_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        reject('Credenciais não encontradas. Verifique o arquivo .env.local');
        return;
      }

      // Para chaves de "App", o Google aceita localhost:3000 se http://localhost estiver no console
      const redirectUri = 'http://localhost:3000';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/drive.file&access_type=offline&prompt=consent`;

      const server = http.createServer(async (req, res) => {
        try {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const code = url.searchParams.get('code');
          const error = url.searchParams.get('error');

          if (error) {
            res.end(`<h1>Erro: ${error}</h1>`);
            server.close();
            reject(error);
            return;
          }

          if (code) {
            res.end('<h1>Autenticado com sucesso!</h1><p>Pode fechar esta aba e voltar ao MedDoc.</p>');
            
            const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)).catch(() => globalThis.fetch(...args));
            
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
              })
            });
            
            const tokenData = await tokenResponse.json();
            server.close();
            
            if (tokenData.error) {
              reject(tokenData.error_description || tokenData.error);
            } else {
              resolve(tokenData);
            }
          }
        } catch (err) {
          res.end('<h1>Erro interno</h1>');
          server.close();
          reject(err.message);
        }
      });

      server.listen(3000, () => {
        shell.openExternal(authUrl);
      });
      
      server.on('error', (e) => {
        reject(`Erro no servidor local (Porta 3000 ocupada?): ${e.message}`);
      });
    });
  });


  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
