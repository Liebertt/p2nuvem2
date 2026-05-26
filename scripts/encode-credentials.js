#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const credentialsPath = path.join(process.cwd(), "google-credentials.json");

if (!fs.existsSync(credentialsPath)) {
  console.error("❌ Erro: arquivo google-credentials.json não encontrado");
  console.error("   Procurando em:", credentialsPath);
  process.exit(1);
}

const credentialsContent = fs.readFileSync(credentialsPath, "utf-8");
const base64Credentials = Buffer.from(credentialsContent).toString("base64");

console.log("\n✅ Credenciais convertidas para Base64:\n");
console.log("GOOGLE_CREDENTIALS_JSON=" + base64Credentials);
console.log("\n📋 Passos:");
console.log("1. Copie o valor acima (tudo após GOOGLE_CREDENTIALS_JSON=)");
console.log("2. Vá para seu projeto na Vercel: https://vercel.com/dashboard");
console.log("3. Settings → Environment Variables");
console.log("4. Adicione uma nova variável com nome: GOOGLE_CREDENTIALS_JSON");
console.log("5. Cole o valor base64");
console.log("6. Clique em Save e Redeploy\n");
