const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const { sendEmail } = require('../utils/email');

// Gerar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc    Registrar um novo usuário
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar se o usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    // Criar novo usuário
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user', // Definir role padrão se não fornecida
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Dados de usuário inválidos' });
    }
  } catch (error) {
    console.error(`Erro ao registrar usuário: ${error.message}`);
    res.status(500).json({ message: 'Erro ao registrar usuário', error: error.message });
  }
};

// @desc    Autenticar usuário e obter token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar se o email e senha foram fornecidos
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, informe email e senha' });
    }

    // Buscar usuário pelo email
    const user = await User.findOne({ email }).select('+password');

    // Verificar se o usuário existe e a senha está correta
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Verificar se o usuário está ativo
    if (!user.isActive) {
      return res.status(401).json({ message: 'Sua conta está desativada. Entre em contato com o administrador.' });
    }

    // Atualizar última data de login
    user.lastLogin = Date.now();
    await user.save();

    // Retornar dados do usuário e token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      department: user.department,
      jobTitle: user.jobTitle,
      isActive: user.isActive,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(`Erro ao fazer login: ${error.message}`);
    res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
  }
};

// @desc    Obter perfil do usuário
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        department: user.department,
        jobTitle: user.jobTitle,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error(`Erro ao obter perfil: ${error.message}`);
    res.status(500).json({ message: 'Erro ao obter perfil', error: error.message });
  }
};

// @desc    Atualizar perfil do usuário
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.jobTitle = req.body.jobTitle || user.jobTitle;
      user.department = req.body.department || user.department;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        department: updatedUser.department,
        jobTitle: updatedUser.jobTitle,
        phone: updatedUser.phone,
        isActive: updatedUser.isActive,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error(`Erro ao atualizar perfil: ${error.message}`);
    res.status(500).json({ message: 'Erro ao atualizar perfil', error: error.message });
  }
};

// @desc    Solicitar redefinição de senha
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Por favor, informe o email' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Gerar token de redefinição
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash do token para armazenar no banco
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Expiração do token (10 minutos)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    
    await user.save();

    // Criar URL de redefinição
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
    
    // Conteúdo do email
    const message = `
      <h1>Redefinição de Senha</h1>
      <p>Você solicitou a redefinição de sua senha.</p>
      <p>Clique no link abaixo para definir uma nova senha:</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
      <p>Se você não solicitou a redefinição, simplesmente ignore este email e nenhuma alteração será feita.</p>
      <p>Este link expira em 10 minutos.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Redefinição de Senha - CRM',
        html: message,
      });

      res.status(200).json({ 
        message: 'Email enviado com sucesso',
        resetToken, // Apenas para ambiente de desenvolvimento
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      console.error(`Erro ao enviar email: ${error.message}`);
      res.status(500).json({ message: 'Não foi possível enviar o email de redefinição' });
    }
  } catch (error) {
    console.error(`Erro ao solicitar redefinição: ${error.message}`);
    res.status(500).json({ message: 'Erro ao processar solicitação de redefinição', error: error.message });
  }
};

// @desc    Redefinir senha
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // Hash do token recebido
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    // Buscar usuário pelo token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    // Definir nova senha
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error(`Erro ao redefinir senha: ${error.message}`);
    res.status(500).json({ message: 'Erro ao redefinir senha', error: error.message });
  }
};

// @desc    Verificar token
// @route   GET /api/auth/verify-token
// @access  Private
const verifyToken = async (req, res) => {
  // Se chegou aqui, o middleware protect já verificou o token
  res.status(200).json({ valid: true, user: req.user._id });
};

module.exports = {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  verifyToken,
};