export class GoogleDriveService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${this.accessToken}`);
    return fetch(url, { ...options, headers });
  }

  async getOrCreateFolder(folderName: string): Promise<string> {
    // Busca pela pasta
    const query = encodeURIComponent(`mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`);
    const searchRes = await this.fetchWithAuth(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`);
    const searchData = await searchRes.json();

    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id; // Retorna o ID da pasta existente
    }

    // Se não encontrou, cria a pasta
    const metadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    };

    const createRes = await this.fetchWithAuth('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata)
    });

    const createData = await createRes.json();
    return createData.id;
  }

  async uploadFile(file: Blob, fileName: string, mimeType: string, folderId?: string) {
    const metadata = {
      name: fileName,
      parents: folderId ? [folderId] : undefined
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file, fileName);

    const res = await this.fetchWithAuth('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      body: form
    });

    if (!res.ok) {
      throw new Error('Falha ao fazer upload para o Google Drive');
    }

    return await res.json();
  }
}
