# EduFlow — Plataforma de E-learning

Plataforma completa de ensino online com upload de vídeos, acompanhamento de progresso e emissão automática de certificados em PDF.

## Stack

**Back-end:** Node.js · TypeScript · Express · Prisma ORM · PostgreSQL  
**Front-end:** React · TypeScript · Vite · TailwindCSS  
**Armazenamento:** Cloudinary (vídeos e imagens)  
**Autenticação:** JWT (Access Token + Refresh Token)  
**PDF:** PDFKit  

## Funcionalidades

### Área do Professor
- Cadastro e gerenciamento de cursos
- Upload de videoaulas (streaming via Cloudinary)
- Organização por módulos e aulas
- Visualização de alunos matriculados e progresso

### Área do Aluno
- Navegação e matrícula em cursos
- Player de vídeo com controle de progresso
- Painel com % de conclusão por curso
- Download do certificado em PDF ao concluir 100%

## Configuração local

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Conta gratuita no [Cloudinary](https://cloudinary.com)

### Variáveis de ambiente

```bash
# api/.env
DATABASE_URL="postgresql://user:pass@localhost:5432/eduflow"
JWT_SECRET="sua_chave_secreta"
JWT_REFRESH_SECRET="sua_chave_refresh"
CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="seu_api_secret"
PORT=3333
```

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/elearning-platform.git
cd elearning-platform

# Backend
cd api
npm install
npx prisma migrate dev
npm run dev

# Frontend (outro terminal)
cd ../web
npm install
npm run dev
```

## Deploy gratuito

| Serviço | Uso | Tier grátis |
|---|---|---|
| [Render.com](https://render.com) | API Node.js | 750h/mês |
| [Supabase](https://supabase.com) | PostgreSQL | 500MB |
| [Cloudinary](https://cloudinary.com) | Vídeos | 25GB |
| [Vercel](https://vercel.com) | Frontend React | Ilimitado |

## Estrutura

```
elearning-platform/
├── api/               # Back-end Node.js + TypeScript
│   ├── prisma/        # Schema e migrations
│   └── src/
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       ├── services/
│       └── utils/
└── web/               # Front-end React + TypeScript
    └── src/
        ├── components/
        ├── contexts/
        ├── hooks/
        ├── pages/
        └── services/
```

## Licença

MIT
