const express = require('express');
const { google } = require('googleapis');
const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.static('public')); // Para servir a interface gráfica estática
app.use(express.json());

// 1. AUTENTICAÇÃO SEGURA
// Configuração do Azure Blob Storage usando a Connection String fornecida
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.CONTAINER_NAME);

// Configuração do Google Drive usando Service Account
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'google-credentials.json'),
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});
const drive = google.drive({ version: 'v3', auth });

// 2. FUNÇÃO: LISTAR DADOS DE ORIGEM (GOOGLE DRIVE)
async function listGoogleDriveFiles() {
    const response = await drive.files.list({
        q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, size)',
    });
    return response.data.files || [];
}

// 3. FUNÇÃO: LISTAR DADOS DE DESTINO (AZURE BLOB STORAGE)
async function listAzureBlobs() {
    const blobs = [];
    // Garante que o contêiner existe antes de listar ou transferir
    await containerClient.createIfNotExists({ access: 'container' });
    
    for await (const blob of containerClient.listBlobsFlat()) {
        blobs.push({ name: blob.name, size: blob.properties.contentLength });
    }
    return blobs;
}

// Rotas da API para a Interface Gráfica
app.get('/api/origem', async (req, res) => {
    try {
        const files = await listGoogleDriveFiles();
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/destino', async (req, res) => {
    try {
        const blobs = await listAzureBlobs();
        res.json(blobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. PROCESSO DE MIGRAÇÃO COM STATUS NO CONSOLE
app.post('/api/migrar', async (req, res) => {
    try {
        const files = await listGoogleDriveFiles();
        console.log(`\n--- Iniciando Migração: ${files.length} arquivos encontrados ---`);
        
        const logs = [];

        for (const file of files) {
            try {
                // Download do Google Drive como Stream
                const driveResponse = await drive.files.get(
                    { fileId: file.id, alt: 'media' },
                    { responseType: 'stream' }
                );

                // Upload direto para o Azure Blob Storage
                const blockBlobClient = containerClient.getBlockBlobClient(file.name);
                
                // Upload usando stream para eficiência de memória
                await blockBlobClient.uploadStream(driveResponse.data);
                
                const statusSucesso = `[SUCESSO] Arquivo "${file.name}" migrado com êxito.`;
                console.log(statusSucesso);
                logs.push({ file: file.name, status: 'Sucesso' });
            } catch (fileError) {
                const statusErro = `[ERRO] Falha ao migrar o arquivo "${file.name}": ${fileError.message}`;
                console.error(statusErro);
                logs.push({ file: file.name, status: `Erro: ${fileError.message}` });
            }
        }

        res.json({ message: 'Processo de migração concluído', logs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));