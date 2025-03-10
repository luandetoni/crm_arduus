# CRM NodeJS

Um sistema completo de CRM (Customer Relationship Management) desenvolvido em NodeJS, Express e MongoDB.

## Características

- 🔐 Autenticação e autorização de usuários
- 👥 Gerenciamento de clientes e leads
- 💼 Gestão de oportunidades e vendas
- 📊 Dashboard e relatórios
- 📅 Calendário e tarefas
- 📧 Envio de emails
- 🔔 Sistema de notificações em tempo real
- 📄 Geração de documentos PDF
- 📱 API RESTful para integração com aplicativos móveis

## Estrutura do Projeto

```
crm-nodejs/
├── src/
│   ├── config/           # Configurações
│   ├── controllers/      # Controladores
│   ├── database/         # Conexão e seeders
│   ├── middleware/       # Middlewares
│   ├── models/           # Modelos/Schemas
│   ├── routes/           # Rotas
│   ├── services/         # Serviços/Lógica de negócio
│   ├── utils/            # Utilitários
│   ├── views/            # Templates
│   └── server.js         # Ponto de entrada
├── uploads/              # Arquivos enviados
├── .env                  # Variáveis de ambiente
└── package.json          # Dependências
```

## Modelos de Dados

### Usuários
- Gerenciamento de usuários do sistema
- Controle de acesso baseado em funções (admin, gerente, vendas, etc.)

### Clientes
- Informações de contato
- Histórico de interações
- Documentos
- Segmentação

### Leads
- Captura e qualificação
- Conversão para clientes
- Acompanhamento e priorização

### Oportunidades
- Pipeline de vendas
- Previsão de receita
- Taxa de conversão

### Produtos
- Catálogo de produtos/serviços
- Precificação
- Estoque

### Vendas
- Pedidos e faturamento
- Pagamentos e parcelamento
- Entrega

### Tarefas
- Gerenciamento de atividades
- Atribuição
- Lembretes

### Interações
- Registro de contatos com clientes
- Histórico de comunicações
- Anotações e follow-ups

## Instalação

1. Clone o repositório
   ```bash
   git clone https://github.com/seu-usuario/crm-nodejs.git
   cd crm-nodejs
   ```

2. Instale as dependências
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. Inicie o banco de dados MongoDB
   ```bash
   # Certifique-se de que o MongoDB está instalado e em execução
   ```

5. Execute o seed do banco de dados (opcional)
   ```bash
   npm run seed
   ```

6. Inicie o servidor
   ```bash
   npm run dev
   ```

## Uso

Após iniciar o servidor, acesse:

```
http://localhost:5000/api/v1/docs
```

A documentação da API estará disponível para consulta.

## Licença

Este projeto está licenciado sob a licença MIT - consulte o arquivo LICENSE para obter detalhes.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.