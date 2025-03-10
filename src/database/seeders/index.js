const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../../models/userModel');
const Customer = require('../../models/customerModel');
const Lead = require('../../models/leadModel');
const Product = require('../../models/productModel');
const Opportunity = require('../../models/opportunityModel');
const Task = require('../../models/taskModel');
const Interaction = require('../../models/interactionModel');
const Sale = require('../../models/saleModel');
const Notification = require('../../models/notificationModel');

// Carregar variáveis de ambiente
dotenv.config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado para seeding'))
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err);
    process.exit(1);
  });

// Dados de exemplo para usuários
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    department: 'administrativo',
    jobTitle: 'Administrador do Sistema',
    phone: '(11) 98765-4321',
    isActive: true,
  },
  {
    name: 'Sales Manager',
    email: 'manager@example.com',
    password: 'manager123',
    role: 'manager',
    department: 'vendas',
    jobTitle: 'Gerente de Vendas',
    phone: '(11) 91234-5678',
    isActive: true,
  },
  {
    name: 'Sales Rep',
    email: 'sales@example.com',
    password: 'sales123',
    role: 'sales',
    department: 'vendas',
    jobTitle: 'Representante de Vendas',
    phone: '(11) 92345-6789',
    isActive: true,
  },
  {
    name: 'Support User',
    email: 'support@example.com',
    password: 'support123',
    role: 'support',
    department: 'suporte',
    jobTitle: 'Atendente de Suporte',
    phone: '(11) 93456-7890',
    isActive: true,
  },
];

// Dados de exemplo para produtos
const products = [
  {
    name: 'Produto Básico',
    sku: 'PROD-001',
    description: 'Um produto básico para iniciantes',
    category: 'Básico',
    price: 99.99,
    costPrice: 50.00,
    status: 'ativo',
    stock: {
      quantity: 100,
    },
    specifications: [
      {
        name: 'Cor',
        value: 'Azul',
      },
      {
        name: 'Tamanho',
        value: 'Médio',
      },
    ],
    tags: ['básico', 'iniciante'],
  },
  {
    name: 'Produto Premium',
    sku: 'PROD-002',
    description: 'Um produto premium com recursos avançados',
    category: 'Premium',
    price: 199.99,
    costPrice: 100.00,
    status: 'ativo',
    stock: {
      quantity: 50,
    },
    specifications: [
      {
        name: 'Cor',
        value: 'Preto',
      },
      {
        name: 'Tamanho',
        value: 'Grande',
      },
    ],
    tags: ['premium', 'avançado'],
  },
  {
    name: 'Serviço de Consultoria',
    sku: 'SERV-001',
    description: 'Serviço de consultoria especializada',
    category: 'Serviços',
    price: 500.00,
    costPrice: 300.00,
    status: 'ativo',
    isService: true,
    tags: ['consultoria', 'serviço'],
  },
  {
    name: 'Assinatura Mensal',
    sku: 'SUB-001',
    description: 'Assinatura mensal com suporte prioritário',
    category: 'Assinaturas',
    price: 49.99,
    costPrice: 20.00,
    status: 'ativo',
    isSubscription: true,
    subscriptionDetails: {
      billingCycle: 'mensal',
      billingPeriod: 1,
    },
    tags: ['assinatura', 'recorrente'],
  },
];

// Função para limpar todos os dados existentes
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Lead.deleteMany({});
    await Product.deleteMany({});
    await Opportunity.deleteMany({});
    await Task.deleteMany({});
    await Interaction.deleteMany({});
    await Sale.deleteMany({});
    await Notification.deleteMany({});
    
    console.log('Banco de dados limpo com sucesso');
  } catch (error) {
    console.error('Erro ao limpar banco de dados:', error);
    process.exit(1);
  }
};

// Função para criar usuários
const createUsers = async () => {
  try {
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} usuários criados`);
    return createdUsers;
  } catch (error) {
    console.error('Erro ao criar usuários:', error);
    process.exit(1);
  }
};

// Função para criar produtos
const createProducts = async (adminUser) => {
  try {
    // Adicionar o adminUser como createdBy em todos os produtos
    const productsWithCreator = products.map(product => ({
      ...product,
      createdBy: adminUser._id,
    }));

    const createdProducts = await Product.create(productsWithCreator);
    console.log(`${createdProducts.length} produtos criados`);
    return createdProducts;
  } catch (error) {
    console.error('Erro ao criar produtos:', error);
    process.exit(1);
  }
};

// Função para criar clientes
const createCustomers = async (users) => {
  const adminUser = users.find(user => user.role === 'admin');
  const salesUser = users.find(user => user.role === 'sales');
  
  const customers = [
    {
      name: 'João Silva',
      email: 'joao.silva@example.com',
      companyName: 'Silva & Cia',
      type: 'business',
      phone: '(11) 95555-1234',
      website: 'www.silvaecia.com.br',
      industry: 'Manufatura',
      status: 'ativo',
      address: {
        street: 'Av. Paulista, 1000',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
      },
      contactPerson: {
        name: 'Maria Silva',
        position: 'Diretora Financeira',
        phone: '(11) 98888-5678',
        email: 'maria@silvaecia.com.br',
      },
      source: 'indicação',
      assignedTo: salesUser._id,
      createdBy: adminUser._id,
    },
    {
      name: 'Ana Santos',
      email: 'ana.santos@example.com',
      type: 'individual',
      phone: '(21) 97777-4321',
      status: 'ativo',
      address: {
        street: 'Rua das Flores, 123',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '22222-000',
      },
      source: 'website',
      assignedTo: salesUser._id,
      createdBy: adminUser._id,
    },
    {
      name: 'Tech Solutions Ltda',
      companyName: 'Tech Solutions',
      email: 'contato@techsolutions.com.br',
      type: 'business',
      phone: '(11) 3333-4444',
      website: 'www.techsolutions.com.br',
      industry: 'Tecnologia',
      status: 'ativo',
      address: {
        street: 'Rua Vergueiro, 500',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '04101-000',
      },
      contactPerson: {
        name: 'Roberto Almeida',
        position: 'CEO',
        phone: '(11) 99999-8888',
        email: 'roberto@techsolutions.com.br',
      },
      source: 'evento',
      assignedTo: salesUser._id,
      createdBy: adminUser._id,
    },
  ];

  try {
    const createdCustomers = await Customer.create(customers);
    console.log(`${createdCustomers.length} clientes criados`);
    return createdCustomers;
  } catch (error) {
    console.error('Erro ao criar clientes:', error);
    process.exit(1);
  }
};

// Função para criar leads
const createLeads = async (users) => {
  const adminUser = users.find(user => user.role === 'admin');
  const salesUser = users.find(user => user.role === 'sales');
  
  const leads = [
    {
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@example.com',
      companyName: 'Oliveira Imports',
      phone: '(11) 96666-7777',
      source: 'website',
      status: 'novo',
      industry: 'Comércio',
      jobTitle: 'Gerente de Compras',
      address: {
        city: 'São Paulo',
        state: 'SP',
      },
      interestLevel: 'alto',
      notes: 'Interessado em produtos premium',
      assignedTo: salesUser._id,
      createdBy: adminUser._id,
    },
    {
      name: 'Fernanda Lima',
      email: 'fernanda.lima@example.com',
      companyName: 'Lima Consultoria',
      phone: '(21) 98765-1234',
      source: 'indicação',
      status: 'contatado',
      industry: 'Consultoria',
      jobTitle: 'Diretora',
      interestLevel: 'médio',
      assignedTo: salesUser._id,
      lastContact: new Date(),
      nextFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias depois
      createdBy: adminUser._id,
    },
    {
      name: 'Ricardo Santos',
      email: 'ricardo.santos@example.com',
      phone: '(31) 99988-7766',
      source: 'mídia social',
      status: 'qualificado',
      jobTitle: 'Autônomo',
      interestLevel: 'alto',
      notes: 'Já utilizou produtos similares de concorrentes',
      assignedTo: salesUser._id,
      lastContact: new Date(),
      nextFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias depois
      createdBy: adminUser._id,
    },
  ];

  try {
    const createdLeads = await Lead.create(leads);
    console.log(`${createdLeads.length} leads criados`);
    return createdLeads;
  } catch (error) {
    console.error('Erro ao criar leads:', error);
    process.exit(1);
  }
};

// Função para criar oportunidades
const createOpportunities = async (users, customers, products) => {
  const salesUser = users.find(user => user.role === 'sales');
  
  const opportunities = [
    {
      title: 'Renovação de contrato anual',
      customer: customers[0]._id,
      stage: 'proposta',
      value: 10000.00,
      probability: 70,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias no futuro
      products: [
        {
          product: products[3]._id, // Assinatura Mensal
          quantity: 10,
          unitPrice: products[3].price,
          discount: 10,
          total: 10 * products[3].price * 0.9,
        },
      ],
      description: 'Renovação do contrato anual com aumento de licenças',
      source: 'indicação',
      priority: 'alta',
      assignedTo: salesUser._id,
      createdBy: salesUser._id,
    },
    {
      title: 'Projeto de consultoria',
      customer: customers[2]._id,
      stage: 'negociação',
      value: 5000.00,
      probability: 60,
      expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 dias no futuro
      products: [
        {
          product: products[2]._id, // Serviço de Consultoria
          quantity: 1,
          unitPrice: products[2].price,
          discount: 0,
          total: products[2].price,
        },
      ],
      description: 'Projeto de consultoria para implementação de novo sistema',
      source: 'website',
      priority: 'média',
      assignedTo: salesUser._id,
      createdBy: salesUser._id,
    },
    {
      title: 'Venda de produtos básicos',
      customer: customers[1]._id,
      stage: 'qualificação',
      value: 499.95,
      probability: 40,
      expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 dias no futuro
      products: [
        {
          product: products[0]._id, // Produto Básico
          quantity: 5,
          unitPrice: products[0].price,
          discount: 0,
          total: 5 * products[0].price,
        },
      ],
      description: 'Interesse inicial em produtos básicos',
      source: 'mídia social',
      priority: 'baixa',
      assignedTo: salesUser._id,
      createdBy: salesUser._id,
    },
  ];

  try {
    const createdOpportunities = await Opportunity.create(opportunities);
    console.log(`${createdOpportunities.length} oportunidades criadas`);
    return createdOpportunities;
  } catch (error) {
    console.error('Erro ao criar oportunidades:', error);
    process.exit(1);
  }
};

// Função para criar tarefas
const createTasks = async (users, customers, leads, opportunities) => {
  const adminUser = users.find(user => user.role === 'admin');
  const salesUser = users.find(user => user.role === 'sales');
  const supportUser = users.find(user => user.role === 'support');
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const tasks = [
    {
      title: 'Ligar para cliente sobre renovação',
      description: 'Discutir detalhes da renovação do contrato anual',
      status: 'pendente',
      priority: 'alta',
      dueDate: tomorrow,
      assignedTo: salesUser._id,
      relatedTo: {
        type: 'customer',
        customer: customers[0]._id,
      },
      category: 'ligação',
      reminder: {
        isSet: true,
        time: new Date(tomorrow.setHours(9, 0, 0, 0)),
      },
      createdBy: adminUser._id,
    },
    {
      title: 'Preparar proposta de consultoria',
      description: 'Criar proposta detalhada para o projeto de consultoria',
      status: 'em_andamento',
      priority: 'média',
      dueDate: nextWeek,
      assignedTo: salesUser._id,
      relatedTo: {
        type: 'opportunity',
        opportunity: opportunities[1]._id,
      },
      category: 'apresentação',
      createdBy: adminUser._id,
    },
    {
      title: 'Acompanhamento de lead qualificado',
      description: 'Entrar em contato para verificar interesse',
      status: 'pendente',
      priority: 'média',
      dueDate: tomorrow,
      assignedTo: salesUser._id,
      relatedTo: {
        type: 'lead',
        lead: leads[2]._id,
      },
      category: 'ligação',
      createdBy: adminUser._id,
    },
    {
      title: 'Verificar feedback do cliente',
      description: 'Verificar satisfação com os produtos adquiridos',
      status: 'pendente',
      priority: 'baixa',
      dueDate: nextWeek,
      assignedTo: supportUser._id,
      relatedTo: {
        type: 'customer',
        customer: customers[1]._id,
      },
      category: 'e-mail',
      createdBy: adminUser._id,
    },
  ];

  try {
    const createdTasks = await Task.create(tasks);
    console.log(`${createdTasks.length} tarefas criadas`);
    return createdTasks;
  } catch (error) {
    console.error('Erro ao criar tarefas:', error);
    process.exit(1);
  }
};

// Função para criar interações
const createInteractions = async (users, customers, leads, opportunities) => {
  const salesUser = users.find(user => user.role === 'sales');
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const interactions = [
    {
      type: 'call',
      subject: 'Apresentação inicial',
      description: 'Ligação para apresentação dos produtos e serviços',
      date: lastWeek,
      duration: 30,
      outcome: 'Cliente interessado em receber proposta',
      direction: 'saída',
      relatedTo: {
        type: 'customer',
        customer: customers[0]._id,
      },
      contactPerson: {
        name: customers[0].contactPerson?.name || customers[0].name,
        position: customers[0].contactPerson?.position || '',
        email: customers[0].contactPerson?.email || customers[0].email,
        phone: customers[0].contactPerson?.phone || customers[0].phone,
      },
      followUpRequired: true,
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 dias no futuro
      followUpNotes: 'Enviar proposta detalhada',
      createdBy: salesUser._id,
    },
    {
      type: 'email',
      subject: 'Envio de material informativo',
      description: 'Email com catálogo de produtos e detalhes de preço',
      date: yesterday,
      direction: 'saída',
      relatedTo: {
        type: 'lead',
        lead: leads[1]._id,
      },
      outcome: 'Lead solicitou mais informações sobre produto premium',
      followUpRequired: true,
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias no futuro
      createdBy: salesUser._id,
    },
    {
      type: 'meeting',
      subject: 'Reunião de negociação',
      description: 'Reunião para discutir termos do contrato',
      date: yesterday,
      duration: 60,
      location: 'Escritório do cliente',
      relatedTo: {
        type: 'opportunity',
        opportunity: opportunities[1]._id,
      },
      contactPerson: {
        name: 'Roberto Almeida',
        position: 'CEO',
        email: 'roberto@techsolutions.com.br',
      },
      meetingNotes: 'Cliente solicitou ajustes na proposta referentes ao prazo de entrega',
      outcome: 'Proposta será revisada',
      followUpRequired: true,
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 dia no futuro
      participants: [salesUser._id],
      createdBy: salesUser._id,
    },
  ];

  try {
    const createdInteractions = await Interaction.create(interactions);
    console.log(`${createdInteractions.length} interações criadas`);
    return createdInteractions;
  } catch (error) {
    console.error('Erro ao criar interações:', error);
    process.exit(1);
  }
};

// Função para criar vendas
const createSales = async (users, customers, opportunities, products) => {
  const salesUser = users.find(user => user.role === 'sales');
  
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Criar apenas uma venda como exemplo
  const sale = {
    number: 'VND-2301-00001', // Será gerado automaticamente, mas definimos para o exemplo
    customer: customers[2]._id,
    opportunity: opportunities[1]._id, // Oportunidade relacionada
    saleDate: yesterday,
    status: 'pago',
    items: [
      {
        product: products[2]._id, // Serviço de Consultoria
        description: 'Serviço de consultoria especializada',
        quantity: 1,
        unitPrice: products[2].price,
        discount: 5,
        tax: 10,
        total: products[2].price * 1 * 0.95 * 1.1,
      },
      {
        product: products[3]._id, // Assinatura Mensal
        description: 'Assinatura mensal - suporte prioritário',
        quantity: 5,
        unitPrice: products[3].price,
        discount: 10,
        tax: 10,
        total: products[3].price * 5 * 0.9 * 1.1,
      },
    ],
    subtotal: products[2].price + (products[3].price * 5),
    discountTotal: (products[2].price * 0.05) + (products[3].price * 5 * 0.1),
    taxTotal: (products[2].price * 0.95 * 0.1) + (products[3].price * 5 * 0.9 * 0.1),
    total: (products[2].price * 0.95 * 1.1) + (products[3].price * 5 * 0.9 * 1.1),
    paymentMethod: 'transferência_bancária',
    paymentStatus: 'pago',
    paymentDueDate: new Date(yesterday.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 dias depois da venda
    payments: [
      {
        amount: (products[2].price * 0.95 * 1.1) + (products[3].price * 5 * 0.9 * 1.1),
        method: 'transferência_bancária',
        date: yesterday,
        reference: 'TED-123456789',
      },
    ],
    shippingAddress: {
      street: 'Rua Vergueiro, 500',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04101-000',
      country: 'Brasil',
    },
    billingAddress: {
      street: 'Rua Vergueiro, 500',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04101-000',
      country: 'Brasil',
    },
    notes: 'Cliente solicitou instalação prioritária',
    termsAndConditions: 'Termos padrão de serviço aplicáveis',
    assignedTo: salesUser._id,
    createdBy: salesUser._id,
  };

  try {
    const createdSale = await Sale.create(sale);
    console.log('Venda de exemplo criada com sucesso');
    return [createdSale];
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    process.exit(1);
  }
};

// Função para criar notificações
const createNotifications = async (users) => {
  const adminUser = users.find(user => user.role === 'admin');
  const salesUser = users.find(user => user.role === 'sales');
  const supportUser = users.find(user => user.role === 'support');
  
  const notifications = [
    {
      title: 'Tarefa atribuída',
      message: 'Uma nova tarefa foi atribuída a você',
      type: 'task',
      priority: 'normal',
      user: salesUser._id,
      isRead: false,
      link: '/tasks/view',
      isSystem: true,
      createdBy: adminUser._id,
    },
    {
      title: 'Oportunidade atualizada',
      message: 'A oportunidade "Projeto de consultoria" foi atualizada',
      type: 'opportunity',
      priority: 'normal',
      user: salesUser._id,
      isRead: false,
      link: '/opportunities/view',
      isSystem: true,
      createdBy: adminUser._id,
    },
    {
      title: 'Lembrete de follow-up',
      message: 'Lembrete para follow-up com cliente Tech Solutions',
      type: 'info',
      priority: 'alta',
      user: salesUser._id,
      isRead: false,
      link: '/customers/view',
      isSystem: true,
      createdBy: adminUser._id,
    },
    {
      title: 'Novo ticket de suporte',
      message: 'Um novo ticket de suporte foi aberto pelo cliente Ana Santos',
      type: 'warning',
      priority: 'alta',
      user: supportUser._id,
      isRead: false,
      link: '/support/tickets',
      isSystem: true,
      createdBy: adminUser._id,
    },
  ];

  try {
    const createdNotifications = await Notification.create(notifications);
    console.log(`${createdNotifications.length} notificações criadas`);
    return createdNotifications;
  } catch (error) {
    console.error('Erro ao criar notificações:', error);
    process.exit(1);
  }
};

// Função principal para executar todo o processo de seeding
const seedData = async () => {
  try {
    // Limpar dados existentes
    await clearDatabase();
    
    // Criar dados em sequência
    const createdUsers = await createUsers();
    const adminUser = createdUsers.find(user => user.role === 'admin');
    
    const createdProducts = await createProducts(adminUser);
    const createdCustomers = await createCustomers(createdUsers);
    const createdLeads = await createLeads(createdUsers);
    const createdOpportunities = await createOpportunities(createdUsers, createdCustomers, createdProducts);
    const createdTasks = await createTasks(createdUsers, createdCustomers, createdLeads, createdOpportunities);
    const createdInteractions = await createInteractions(createdUsers, createdCustomers, createdLeads, createdOpportunities);
    const createdSales = await createSales(createdUsers, createdCustomers, createdOpportunities, createdProducts);
    const createdNotifications = await createNotifications(createdUsers);
    
    console.log('Dados semeados com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao semear dados:', error);
    process.exit(1);
  }
};

// Executar o seeding
seedData();