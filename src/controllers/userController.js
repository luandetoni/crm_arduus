const User = require('../models/userModel');
const { sendWelcomeEmail } = require('../utils/email');

// @desc    Obter todos os usuários
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    // Implementar paginação
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skipIndex = (page - 1) * limit;

    // Filtros
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
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
    const total = await User.countDocuments(filter);

    // Buscar usuários com filtros, paginação e ordenação
    const users = await User.find(filter)
      .select('-password')
      .limit(limit)
      .skip(skipIndex)
      .sort(sort);

    res.json({
      users,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error(`Erro ao obter usuários: ${error.message}`);
    res.status(500).json({ message: 'Erro ao obter usuários', error: error.message });
  }
};

// @desc    Obter usuário por ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error(`Erro ao obter usuário: ${error.message}`);
    res.status(500).json({ message: 'Erro ao obter usuário', error: error.message });
  }
};

// @desc    Criar um novo usuário
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, jobTitle, phone } = req.body;

    // Verificar se o usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Usuário com este email já existe' });
    }

    // Criar usuário
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      department: department || 'outros',
      jobTitle,
      phone,
      createdBy: req.user._id,
    });

    // Enviar email de boas-vindas
    try {
      await sendWelcomeEmail(user);
    } catch (emailError) {
      console.error(`Erro ao enviar email de boas-vindas: ${emailError.message}`);
      // Não impede a criação do usuário se o email falhar
    }

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        jobTitle: user.jobTitle,
        phone: user.phone,
        isActive: user.isActive,
      });
    } else {
      res.status(400).json({ message: 'Dados de usuário inválidos' });
    }
  } catch (error) {
    console.error(`Erro ao criar usuário: ${error.message}`);
    res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
  }
};

// @desc    Atualizar usuário
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.department = req.body.department || user.department;
      user.jobTitle = req.body.jobTitle || user.jobTitle;
      user.phone = req.body.phone || user.phone;
      user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        jobTitle: updatedUser.jobTitle,
        phone: updatedUser.phone,
        isActive: updatedUser.isActive,
      });
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error(`Erro ao atualizar usuário: ${error.message}`);
    res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
  }
};

// @desc    Excluir usuário
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Verificar se o usuário a ser excluído não é o próprio admin que faz a solicitação
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'Não é possível excluir seu próprio usuário' });
      }

      await user.deleteOne();
      res.json({ message: 'Usuário removido com sucesso' });
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error(`Erro ao excluir usuário: ${error.message}`);
    res.status(500).json({ message: 'Erro ao excluir usuário', error: error.message });
  }
};

// @desc    Atualizar avatar do usuário
// @route   PUT /api/users/:id/avatar
// @access  Private/Admin
const updateUserAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    // Atualizar caminho do avatar
    user.avatar = req.file.path.replace(/\\/g, '/'); // Normalizar caminho para URL
    await user.save();

    res.json({
      _id: user._id,
      avatar: user.avatar,
      message: 'Avatar atualizado com sucesso',
    });
  } catch (error) {
    console.error(`Erro ao atualizar avatar: ${error.message}`);
    res.status(500).json({ message: 'Erro ao atualizar avatar', error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserAvatar,
};