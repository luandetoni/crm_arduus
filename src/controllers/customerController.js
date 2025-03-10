const Customer = require('../models/customerModel');
const Interaction = require('../models/interactionModel');
const Opportunity = require('../models/opportunityModel');
const Sale = require('../models/saleModel');

// @desc    Obter todos os clientes
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res) => {
  try {
    // Implementar paginação
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skipIndex = (page - 1) * limit;

    // Filtros
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.industry) filter.industry = req.query.industry;
    if (req.query.source) filter.source = req.query.source;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    if (req.query.tags) {
      filter.tags = { $in: req.query.tags.split(',') };
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { companyName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Ordenação
    const sort = {};
    if (req.query.sortField) {
      sort[req.query.sortField] = req.query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Padrão: mais recentes primeiro
    }

    // Contar total para paginação
    const total = await Customer.countDocuments(filter);

    // Buscar clientes com filtros, paginação e ordenação
    const customers = await Customer.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .limit(limit)
      .skip(skipIndex)
      .sort(sort);

    res.json({
      customers,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error(`Erro ao obter clientes: ${error.message}`);
    res.status(500).json({ message: 'Erro ao obter clientes', error: error.message });
  }
};

// @desc    Obter cliente por ID
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name');

    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ message: 'Cliente não encontrado' });
    }
  } catch (error) {
    console.error(`Erro ao obter cliente: ${error.message}`);
    res.status(500).json({ message: 'Erro ao obter cliente', error: error.message });
  }
};

// @desc    Criar um novo cliente
// @route   POST /api/customers
// @access  Private
const createCustomer = async (req, res) => {
  try {
    const { 
      name, 
      companyName, 
      type, 
      email, 
      phone, 
      website, 
      industry,
      status,
      address,
      contactPerson,
      tags,
      notes,
      source,
      assignedTo
    } = req.body;

    // Verificar se cliente com este email já existe
    const customerExists = await Customer.findOne({ email });
    if (customerExists) {
      return res.status(400).json({ message: 'Cliente com este email já existe' });
    }

    // Criar cliente
    const customer = await Customer.create({
      name,
      companyName,
      type: type || 'individual',
      email,
      phone,
      website,
      industry,
      status: status || 'ativo',
      address,
      contactPerson,
      tags,
      notes,
      source: source || 'outros',
      assignedTo: assignedTo || req.user._id,
      createdBy: req.user._id,
    });

    if (customer) {
      // Enviar notificação em tempo real via Socket.io
      if (req.io) {
        req.io.emit('newCustomer', {
          message: 'Novo cliente cadastrado',
          customer: {
            id: customer._id,
            name: customer.name,
            email: customer.email,
          },
        });
      }

      res.status(201).json(customer);
    } else {
      res.status(400).json({ message: 'Dados de cliente inválidos' });
    }
  } catch (error) {
    console.error(`Erro ao criar cliente: ${error.message}`);
    res.status(500).json({ message: 'Erro ao criar cliente', error: error.message });
  }
};

// @desc    Atualizar cliente
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    // Atualizar dados
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'createdBy' && key !== 'createdAt' && key !== 'updatedAt') {
        customer[key] = req.body[key];
      }
    });

    const updatedCustomer = await customer.save();

    // Notificar sobre atualização via Socket.io
    if (req.io) {
      req.io.emit('updateCustomer', {
        message: 'Cliente atualizado',
        customer: {
          id: updatedCustomer._id,
          name: updatedCustomer.name,
        },
      });
    }

    res.json(updatedCustomer);
  } catch (error) {
    console.error(`Erro ao atualizar cliente: ${error.message}`);
    res.status(500).json({ message: 'Erro ao atualizar cliente', error: error.message });
  }
};

// @desc    Excluir cliente
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    // Verificar se existem registros relacionados
    const opportunities = await Opportunity.countDocuments({ customer: customer._id });
    const sales = await Sale.countDocuments({ customer: customer._id });
    const interactions = await Interaction.countDocuments({ 'relatedTo.customer': customer._id });

    if (opportunities > 0 || sales > 0 || interactions > 0) {
      return res.status(400).json({ 
        message: 'Não é possível excluir este cliente pois existem registros relacionados',
        relatedRecords: {
          opportunities,
          sales,
          interactions,
        },
      });
    }

    await customer.deleteOne();

    // Notificar sobre exclusão via Socket.io
    if (req.io) {
      req.io.emit('deleteCustomer', {
        message: 'Cliente excluído',
        customerId: req.params.id,
      });
    }

    res.json({ message: 'Cliente removido com sucesso' });
  } catch (error) {
    console.error(`Erro ao excluir cliente: ${error.message}`);
    res.status(500).json({ message: 'Erro ao excluir cliente', error: error.message });
  }
};

// @desc    Adicionar documento ao cliente
// @route   POST /api/customers/:id/documents
// @access  Private
const addCustomerDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    // Adicionar documento
    customer.documents.push({
      name: req.file.originalname,
      path: req.file.path.replace(/\\/g, '/'),
      type: req.file.mimetype,
      uploadedAt: Date.now(),
    });

    const updatedCustomer = await customer.save();

    res.status(201).json({
      message: 'Documento adicionado com sucesso',
      document: updatedCustomer.documents[updatedCustomer.documents.length - 1],
    });
  } catch (error) {
    console.error(`Erro ao adicionar documento: ${error.message}`);
    res.status(500).json({ message: 'Erro ao adicionar documento', error: error.message });
  }
};

// @desc    Obter interações do cliente
// @route   GET /api/customers/:id/interactions
// @access  Private
const getCustomerInteractions = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const interactions = await Interaction.find({
      'relatedTo.type': 'customer',
      'relatedTo.customer': customer._id,
    })
      .populate('createdBy', 'name avatar')
      .populate('participants', 'name avatar')
      .sort({ date: -1 });

    res.json(interactions);
  } catch (error) {
    console.error(`Erro ao obter interações: ${error.message}`);
    res.status(500).json({ message: 'Erro ao obter interações', error: error.message });
  }
};

// @desc    Obter oportunidades do cliente
// @route   GET /api/customers/:id/opportunities
// @access  Private
const getCustomerOpportunities = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const opportunities = await Opportunity.find({ customer: customer._id })
      .populate('assignedTo', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(opportunities);
  } catch (error) {
    console.error(`Erro ao obter oportunidades: ${error.message}`);
    res.status(500).json({ message: 'Erro ao obter oportunidades', error: error.message });
  }
};

// @desc    Obter vendas do cliente
// @route   GET /api/customers/:id/sales
// @access  Private
const getCustomerSales = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const sales = await Sale.find({ customer: customer._id })
      .populate('assignedTo', 'name avatar')
      .sort({ saleDate: -1 });

    res.json(sales);
  } catch (error) {
    console.error(`Erro ao obter vendas: ${error.message}`);
    res.status(500).json({ message: 'Erro ao obter vendas', error: error.message });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addCustomerDocument,
  getCustomerInteractions,
  getCustomerOpportunities,
  getCustomerSales,
};