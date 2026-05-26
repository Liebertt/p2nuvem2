// Função para carregar credenciais do Google de forma robusta
function getGoogleCredentials() {
  const fs = require("fs");
  const path = require("path");

  try {
    // 1. Tentar carregar de variável de ambiente (Vercel)
    if (process.env.GOOGLE_CREDENTIALS_JSON) {
      console.log("[DEBUG] Carregando credenciais de GOOGLE_CREDENTIALS_JSON");
      const trimmed = process.env.GOOGLE_CREDENTIALS_JSON.trim();

      // Função auxiliar para analisar JSON e corrigir quebras de linha literais se necessário
      const tryParseJson = (str) => {
        try {
          return JSON.parse(str);
        } catch (error) {
          // Se falhar devido a caracteres de controle ou quebras de linha literais na private_key
          if (
            error.message.includes("control character") ||
            error.message.includes("line break") ||
            error.message.includes("newline") ||
            error.message.includes("token")
          ) {
            try {
              console.log("[DEBUG] Tentando corrigir quebras de linha na private_key...");
              // Escapa quebras de linha reais dentro do valor da chave privada
              const cleaned = str.replace(/"private_key":\s*"([^"]*)"/gs, (match, p1) => {
                return '"private_key": ' + JSON.stringify(p1.replace(/\r?\n/g, '\n'));
              });
              return JSON.parse(cleaned);
            } catch (innerError) {
              throw error; // Lança o erro original se a correção falhar
            }
          }
          throw error;
        }
      };

      try {
        let rawJson = "";
        if (trimmed.startsWith("{")) {
          console.log("[DEBUG] Detectado JSON bruto em GOOGLE_CREDENTIALS_JSON");
          rawJson = trimmed;
        } else {
          console.log("[DEBUG] Detectado provável formato Base64. Decodificando...");
          rawJson = Buffer.from(trimmed, "base64").toString("utf-8").trim();
        }

        const parsed = tryParseJson(rawJson);
        console.log("[DEBUG] Credenciais do Google carregadas com sucesso!");
        return parsed;
      } catch (error) {
        console.error("[ERROR] Falha ao decodificar/analisar GOOGLE_CREDENTIALS_JSON:", error.message);
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

