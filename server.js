const express = require("express");
const { google } = require("googleapis");
const { BlobServiceClient } = require("@azure/storage-blob");
const path = require("path");
require("dotenv").config();
const { getGoogleCredentials } = require("./lib/credentials");

const app = express();
app.use(express.static("public")); // Para servir a interface gráfica estática
app.use(express.json());

// Rota raiz - serve o index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 1. AUTENTICAÇÃO SEGURA
// Configuração do Azure Blob Storage usando a Connection String fornecida
let blobServiceClient;
let containerClient;

try {
  blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_CONNECTION_STRING,
  );
  containerClient = blobServiceClient.getContainerClient(
    process.env.CONTAINER_NAME,
  );
  console.log("[OK] Conexão Azure Blob Storage configurada");
} catch (error) {
  console.error("[ERROR] Falha ao configurar Azure:", error.message);
}

// Configuração lazy do Google Drive
let drive = null;

function initializeGoogleDrive() {
  if (drive) return drive;

  try {
    console.log("[DEBUG] Inicializando Google Drive...");
    const googleCredentials = getGoogleCredentials();
    const auth = new google.auth.GoogleAuth({
      credentials: googleCredentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
    drive = google.drive({ version: "v3", auth });
    console.log("[OK] Google Drive inicializado");
    return drive;
  } catch (error) {
    console.error("[ERROR] Falha ao inicializar Google Drive:", error.message);
    throw error;
  }
}

// 2. FUNÇÃO: LISTAR DADOS DE ORIGEM (GOOGLE DRIVE)
async function listGoogleDriveFiles() {
  const driveInstance = initializeGoogleDrive();
  const response = await driveInstance.files.list({
    q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false`,
    fields: "files(id, name, mimeType, size)",
  });
  return response.data.files || [];
}

// 3. FUNÇÃO: LISTAR DADOS DE DESTINO (AZURE BLOB STORAGE)
async function listAzureBlobs() {
  const blobs = [];
  // Garante que o contêiner existe antes de listar ou transferir
  await containerClient.createIfNotExists({ access: "container" });

  for await (const blob of containerClient.listBlobsFlat()) {
    blobs.push({ name: blob.name, size: blob.properties.contentLength });
  }
  return blobs;
}

// Rotas da API para a Interface Gráfica
app.get("/api/origem", async (req, res) => {
  try {
    console.log("[API] GET /api/origem");
    const files = await listGoogleDriveFiles();
    res.json(files);
  } catch (error) {
    console.error("[API ERROR] /api/origem:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/destino", async (req, res) => {
  try {
    console.log("[API] GET /api/destino");
    const blobs = await listAzureBlobs();
    res.json(blobs);
  } catch (error) {
    console.error("[API ERROR] /api/destino:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 4. PROCESSO DE MIGRAÇÃO COM STATUS NO CONSOLE
app.post("/api/migrar", async (req, res) => {
  try {
    const files = await listGoogleDriveFiles();
    console.log(
      `\n--- Iniciando Migração: ${files.length} arquivos encontrados ---`,
    );

    const logs = [];

    for (const file of files) {
      try {
        // Download do Google Drive como Stream
        const driveInstance = initializeGoogleDrive();
        const driveResponse = await driveInstance.files.get(
          { fileId: file.id, alt: "media" },
          { responseType: "stream" },
        );

        // Upload direto para o Azure Blob Storage
        const blockBlobClient = containerClient.getBlockBlobClient(file.name);

        // Upload usando stream para eficiência de memória
        await blockBlobClient.uploadStream(driveResponse.data);

        const statusSucesso = `[SUCESSO] Arquivo "${file.name}" migrado com êxito.`;
        console.log(statusSucesso);
        logs.push({ file: file.name, status: "Sucesso" });
      } catch (fileError) {
        const statusErro = `[ERRO] Falha ao migrar o arquivo "${file.name}": ${fileError.message}`;
        console.error(statusErro);
        logs.push({ file: file.name, status: `Erro: ${fileError.message}` });
      }
    }

    res.json({ message: "Processo de migração concluído", logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
