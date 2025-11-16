# 🧪 LabSnap - Assistente de Química com IA

Clone do PhotoMath especializado em **Química**. Digitalize problemas químicos impressos ou manuscritos usando a câmera, ou use a calculadora científica integrada. O app decompõe cada problema em passos simples com explicações detalhadas.

## ✨ Funcionalidades

- 📸 **Captura de Imagens**: Tire fotos de problemas químicos ou faça upload de imagens
- 🧮 **Calculadora Científica**: Digite problemas e equações químicas
- 📚 **Explicações Passo a Passo**: Soluções detalhadas com múltiplos métodos
- 📊 **Histórico Completo**: Salve e revise problemas resolvidos
- ⭐ **Favoritos**: Marque problemas importantes
- 🎨 **Interface Moderna**: Design responsivo para mobile e desktop

## 🎯 Tópicos de Química Suportados

- **Química Básica**: Átomos, elementos, tabela periódica, moléculas, ligações químicas
- **Química Geral**: Reações químicas, estequiometria, leis dos gases, termodinâmica
- **Química Orgânica**: Hidrocarbonetos, grupos funcionais, isomeria, reações orgânicas
- **Química Inorgânica**: Compostos iônicos, sais, óxidos, ácidos e bases
- **Química Analítica**: Titulação, análise gravimétrica, espectroscopia
- **Química Física**: Cinética molecular, termodinâmica, eletroquímica
- **Bioquímica**: Metabolismo, enzimas, biomoléculas

## 🚀 Configuração Rápida

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Você tem **3 opções** para configurar:

#### Opção A: Configuração Automática (Recomendado)
1. Inicie o app: `npm run dev`
2. Clique no **banner laranja** que aparecerá
3. Cole suas credenciais
4. Pronto! ✅

#### Opção B: Integração OAuth Supabase
1. Vá em **Configurações do Projeto → Integrações**
2. Clique em **"Conectar Supabase"**
3. Autorize e selecione seu projeto
4. Variáveis configuradas automaticamente! ✅

#### Opção C: Configuração Manual
1. Copie `.env.local.example` para `.env.local`
2. Preencha as variáveis:

```env
# Supabase (https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui

# OpenAI (https://platform.openai.com/api-keys)
NEXT_PUBLIC_OPENAI_API_KEY=sk-sua-chave-openai-aqui
```

### 3. Configurar Banco de Dados Supabase

Execute o SQL no **Supabase SQL Editor**:

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** → **New Query**
4. Copie e cole o conteúdo de `supabase-schema.sql`
5. Clique em **Run** ▶️

Isso criará:
- ✅ Tabela `chem_problems` (problemas químicos)
- ✅ Bucket `chem-images` (armazenamento de imagens)
- ✅ Políticas de segurança (RLS)
- ✅ Índices para performance

### 4. Iniciar Aplicação

```bash
npm run dev
```

Acesse: http://localhost:3000

## 🔧 Troubleshooting

### ❌ Erro: "Permissão de câmera negada"
**Solução**: Permita o acesso à câmera nas configurações do navegador ou use a opção "Fazer Upload"

### ❌ Erro: "OpenAI API key não configurada"
**Solução**: 
1. Obtenha sua chave em: https://platform.openai.com/api-keys
2. Configure `NEXT_PUBLIC_OPENAI_API_KEY` no `.env.local`
3. Reinicie o servidor: `npm run dev`

### ❌ Erro: "Failed to upload image"
**Solução**: 
1. Execute o SQL em `supabase-schema.sql` no Supabase
2. Verifique se o bucket `chem-images` foi criado
3. Verifique suas credenciais do Supabase

### ❌ Erro: "Failed to save problem"
**Solução**: 
1. Execute o SQL em `supabase-schema.sql` no Supabase
2. Verifique se a tabela `chem_problems` foi criada
3. Verifique as políticas RLS

### ❌ Erro: "401 Unauthorized" (OpenAI)
**Solução**: 
1. Verifique se sua API Key está correta
2. Certifique-se de ter créditos na conta OpenAI
3. Acesse: https://platform.openai.com/account/billing

## 📦 Stack Tecnológica

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS v4
- **Componentes**: Shadcn/ui
- **Banco de Dados**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **IA**: OpenAI GPT-4o (com visão)
- **Ícones**: Lucide React

## 🎨 Funcionalidades Detalhadas

### 📸 Captura de Imagens
- Acesso à câmera do dispositivo (frontal/traseira)
- Upload de imagens da galeria
- Preview antes de analisar
- Validação de tipo e tamanho de arquivo
- Upload automático para Supabase Storage

### 🧮 Calculadora Científica
- Operações básicas (+, -, ×, ÷)
- Funções trigonométricas (sin, cos, tan)
- Logaritmos (log, ln)
- Potências e raízes (x², √)
- Parênteses para expressões complexas
- Histórico de cálculos

### 📚 Análise com IA
- Reconhecimento de texto impresso e manuscrito
- Identificação automática do tópico de química
- Resolução passo a passo detalhada
- Múltiplos métodos de resolução
- Fórmulas químicas e cálculos
- Explicações didáticas

### 📊 Histórico
- Lista de todos os problemas resolvidos
- Filtros por tópico e favoritos
- Busca por texto
- Ordenação por data
- Visualização de soluções anteriores

## 💰 Custos Estimados

### OpenAI GPT-4o
- Análise de imagem: ~$0.005 por problema
- Análise de texto: ~$0.002 por problema

### Supabase
- **Plano Gratuito**: 500MB storage, 2GB bandwidth
- Suficiente para ~1000 problemas com imagens
- Upgrade disponível se necessário

## 🔒 Segurança

- ✅ Row Level Security (RLS) habilitado
- ✅ Usuários veem apenas seus próprios dados
- ✅ Políticas de storage configuradas
- ✅ Variáveis de ambiente protegidas
- ✅ Validação de entrada de dados

## 📝 Estrutura do Projeto

```
chemsnap/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyze/
│   │   │       └── route.ts          # API route para OpenAI
│   │   ├── layout.tsx                # Layout principal
│   │   └── page.tsx                  # Página inicial
│   ├── components/
│   │   ├── custom/
│   │   │   ├── camera-capture.tsx    # Componente de câmera
│   │   │   ├── calculator.tsx        # Calculadora científica
│   │   │   ├── solution-display.tsx  # Exibição de soluções
│   │   │   └── history-panel.tsx     # Painel de histórico
│   │   └── ui/                       # Componentes Shadcn/ui
│   └── lib/
│       ├── openai.ts                 # Cliente OpenAI
│       └── supabase.ts               # Cliente Supabase
├── supabase-schema.sql               # Schema do banco de dados
├── .env.local.example                # Exemplo de variáveis
└── README.md                         # Este arquivo
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Melhorar a documentação
- Adicionar novos tópicos de química

## 📄 Licença

MIT License - Sinta-se livre para usar em seus projetos!

## 🎓 Sobre

ChemSnap foi criado para ajudar estudantes a compreender química de forma mais intuitiva e eficiente. Inspirado no PhotoMath, mas focado exclusivamente em problemas químicos.

---

**Desenvolvido com ❤️ e ⚗️**

Para suporte ou dúvidas, abra uma issue no repositório.
