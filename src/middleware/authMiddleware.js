const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Proteção de rotas - verificação do token JWT
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obter token do header
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obter usuário sem a senha
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Não autorizado, token inválido' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado, sem token' });
  }
};

// Verificação de roles/permissões
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autorizado, usuário não encontrado' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Não autorizado para acessar este recurso' });
    }
    
    next();
  };
};

module.exports = { protect, authorize };