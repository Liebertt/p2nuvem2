// Função para carregar credenciais do Google
function getGoogleCredentials() {
  const fs = require("fs");
  const path = require("path");

  // 1. Tentar carregar de variável de ambiente (Vercel)
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    const credentialsJson = Buffer.from(
      process.env.GOOGLE_CREDENTIALS_JSON,
      "base64",
    ).toString("utf-8");
    return JSON.parse(credentialsJson);
  }

  // 2. Tentar carregar do arquivo local (desenvolvimento)
  const credentialsPath = path.join(__dirname, "google-credentials.json");
  if (fs.existsSync(credentialsPath)) {
    return require(credentialsPath);
  }

  throw new Error(
    "Google credentials not found. Please set GOOGLE_CREDENTIALS_JSON environment variable or add google-credentials.json file.",
  );
}

module.exports = { getGoogleCredentials };
