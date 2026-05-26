# Migrador de Arquivos: Google Drive → Azure Blob Storage

Aplicação Node.js que migra arquivos do Google Drive para Azure Blob Storage com interface web intuitiva.

## 🚀 Deploy na Vercel

### Pré-requisitos

- Conta no [Vercel](https://vercel.com)
- Repositório GitHub conectado

### Passos para Deploy

1. **Conecte seu repositório no Vercel:**
   - Acesse [vercel.com/new](https://vercel.com/new)
   - Selecione este repositório
   - Clique em "Import"

2. **Configure as variáveis de ambiente:**
   - Na seção "Environment Variables", adicione:
     - `AZURE_CONNECTION_STRING`: Sua connection string do Azure Blob Storage
     - `CONTAINER_NAME`: Nome do container (ex: `aluno-lieberte`)
     - `GOOGLE_DRIVE_FOLDER_ID`: ID da pasta no Google Drive

3. **Deploy:**
   - Clique em "Deploy"
   - Aguarde a conclusão do deploy

## 🔑 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
AZURE_CONNECTION_STRING=your_azure_connection_string
CONTAINER_NAME=aluno-lieberte
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
PORT=3000
```

## 📋 Estrutura do Projeto

```
├── server.js                      # Backend Express
├── public/
│   └── index.html                # Interface web
├── vercel.json                    # Configuração Vercel
├── .gitignore                     # Arquivos ignorados
├── .vercelignore                  # Arquivos ignorados Vercel
├── package.json                   # Dependências
└── google-credentials.json        # Credenciais Google (não commitar)
```

## 📦 Dependências

- `express`: Framework web
- `googleapis`: API do Google Drive
- `@azure/storage-blob`: SDK do Azure Blob Storage
- `dotenv`: Carregamento de variáveis de ambiente

## 🔐 Segurança

⚠️ **IMPORTANTE:**

- Nunca commitar `.env` ou `google-credentials.json`
- Usar "Environment Variables" do Vercel para secrets
- As credenciais estão protegidas no `.gitignore`

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar servidor
node server.js

# Acessar em http://localhost:3000
```

## 📝 Funcionalidades

- ✅ Listar arquivos do Google Drive
- ✅ Listar blobs no Azure Storage
- ✅ Migrar arquivos com progresso em tempo real
- ✅ Console intuitivo com status de sucesso/erro
- ✅ Interface responsiva e amigável

## 🐛 Troubleshooting

**Erro: Cannot read properties of undefined**

- Verifique se as variáveis de ambiente estão configuradas

**Erro: No such file or directory, open 'google-credentials.json'**

- Adicione as credenciais do Google na raiz do projeto

**Erro: The specified resource name contains invalid characters**

- O nome do container deve conter apenas números, letras minúsculas e hífens

---

Desenvolvido com ❤️ para migração na nuvem
