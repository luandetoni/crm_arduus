const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');
const rateLimit = require("express-rate-limit");

// Carregar variáveis de ambiente
dotenv.config();

// Conectar ao banco de dados
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware para disponibilizar io para os controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Configurações de segurança
app.use(helmet({
  contentSecurityPolicy: false // Desativando para facilitar o desenvolvimento do frontend
}));
app.use(cors());

// Limitar requisições para evitar ataques de força bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requisições por IP
});
app.use('/api/', limiter);

// Middleware para parser JSON e urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware para logging em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Configurar EJS como view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Rota raiz - Renderizar página inicial
app.get('/', (req, res) => {
  res.render('index', {
    title: 'CRM - Sistema de Gestão de Relacionamento com Clientes'
  });
});

// Rotas de views (frontend)
app.get('/login', (req, res) => {
  res.render('login', { title: 'Login | CRM' });
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Registrar | CRM' });
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard', { title: 'Dashboard | CRM' });
});

app.get('/customers', (req, res) => {
  res.render('customers/index', { title: 'Clientes | CRM' });
});

app.get('/customers/new', (req, res) => {
  res.render('customers/new', { title: 'Novo Cliente | CRM' });
});

app.get('/customers/:id', (req, res) => {
  res.render('customers/view', { title: 'Detalhes do Cliente | CRM', customerId: req.params.id });
});

app.get('/leads', (req, res) => {
  res.render('leads/index', { title: 'Leads | CRM' });
});

app.get('/opportunities', (req, res) => {
  res.render('opportunities/kanban', { title: 'Oportunidades | CRM' });
});

app.get('/opportunities/list', (req, res) => {
  res.render('opportunities/index', { title: 'Lista de Oportunidades | CRM' });
});

app.get('/opportunities/new', (req, res) => {
  res.render('opportunities/new', { title: 'Nova Oportunidade | CRM' });
});

app.get('/opportunities/:id', (req, res) => {
  res.render('opportunities/view', { title: 'Detalhes da Oportunidade | CRM', opportunityId: req.params.id });
});

app.get('/opportunities/:id/edit', (req, res) => {
  res.render('opportunities/edit', { title: 'Editar Oportunidade | CRM', opportunityId: req.params.id });
});

app.get('/sales', (req, res) => {
  res.render('sales/index', { title: 'Vendas | CRM' });
});

app.get('/products', (req, res) => {
  res.render('products/index', { title: 'Produtos | CRM' });
});

app.get('/tasks', (req, res) => {
  res.render('tasks/index', { title: 'Tarefas | CRM' });
});

app.get('/calendar', (req, res) => {
  res.render('calendar/index', { title: 'Calendário | CRM' });
});

app.get('/reports', (req, res) => {
  res.render('reports/index', { title: 'Relatórios | CRM' });
});

app.get('/settings', (req, res) => {
  res.render('settings/index', { title: 'Configurações | CRM' });
});

app.get('/profile', (req, res) => {
  res.render('profile', { title: 'Meu Perfil | CRM' });
});

// Rotas da API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/opportunities', require('./routes/opportunityRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/calendar', require('./routes/calendarRoutes'));
app.use('/api/emails', require('./routes/emailRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Middleware para rotas não encontradas
app.use(notFound);

// Middleware para tratamento de erros
app.use(errorHandler);

// Configuração de socket.io para tempo real
io.on('connection', (socket) => {
  console.log('Novo cliente conectado');
  
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

const PORT = process.env.PORT || 5001; // Usando porta 5001 para evitar conflito

server.listen(PORT, () => {
  console.log(`Servidor rodando em ${process.env.NODE_ENV} na porta ${PORT}`);
});