// Função para carregar credenciais do Google
function getGoogleCredentials() {
  const fs = require("fs");
  const path = require("path");

  try {
    // 1. Tentar carregar de variável de ambiente (Vercel)
    if (process.env.GOOGLE_CREDENTIALS_JSON) {
      console.log("[DEBUG] Carregando credenciais de GOOGLE_CREDENTIALS_JSON");
      try {
        const credentialsJson = Buffer.from(
          process.env.GOOGLE_CREDENTIALS_JSON,
          "base64",
        ).toString("utf-8");
        const parsed = JSON.parse(credentialsJson);
        console.log("[DEBUG] Credenciais do Google carregadas com sucesso");
        return parsed;
      } catch (error) {
        console.error(
          "[ERROR] Falha ao decodificar GOOGLE_CREDENTIALS_JSON:",
          error.message,
        );
        throw new Error(`Invalid GOOGLE_CREDENTIALS_JSON: ${error.message}`);
      }
    }

    // 2. Tentar carregar do arquivo local (desenvolvimento)
    const credentialsPath = path.join(
      __dirname,
      "..",
      "google-credentials.json",
    );
    console.log("[DEBUG] Procurando credenciais em:", credentialsPath);

    if (fs.existsSync(credentialsPath)) {
      console.log("[DEBUG] Arquivo google-credentials.json encontrado");
      return require(credentialsPath);
    }

    throw new Error(
      "Google credentials not found. Please set GOOGLE_CREDENTIALS_JSON environment variable or add google-credentials.json file.",
    );
  } catch (error) {
    console.error("[ERROR] getGoogleCredentials:", error.message);
    throw error;
  }
}

module.exports = { getGoogleCredentials };
