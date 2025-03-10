const express = require('express');
const { 
  register, 
  login, 
  getUserProfile, 
  updateUserProfile, 
  forgotPassword,
  resetPassword,
  verifyToken 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Rota base para /api/auth
router.get('/', (req, res) => {
  res.json({
    message: 'API de Autenticação',
    endpoints: [
      { method: 'POST', path: '/register', description: 'Registrar novo usuário' },
      { method: 'POST', path: '/login', description: 'Fazer login' },
      { method: 'POST', path: '/forgot-password', description: 'Solicitar redefinição de senha' },
      { method: 'POST', path: '/reset-password/:resetToken', description: 'Redefinir senha' },
      { method: 'GET', path: '/profile', description: 'Obter perfil do usuário (protegido)' },
      { method: 'PUT', path: '/profile', description: 'Atualizar perfil do usuário (protegido)' },
      { method: 'GET', path: '/verify-token', description: 'Verificar token (protegido)' }
    ]
  });
});

// Rotas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);

// Rotas protegidas
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/verify-token', protect, verifyToken);

module.exports = router;