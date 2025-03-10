const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Todas as rotas são protegidas
router.use(protect);

router.route('/')
  .get((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para obter notificações do usuário atual' });
  });

router.route('/unread')
  .get((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para obter notificações não lidas do usuário atual' });
  });

router.route('/:id/read')
  .put((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para marcar notificação com ID ${req.params.id} como lida` });
  });

router.route('/read-all')
  .put((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para marcar todas as notificações como lidas' });
  });

router.route('/:id')
  .delete((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para excluir notificação com ID ${req.params.id}` });
  });

router.route('/clear-all')
  .delete((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para excluir todas as notificações do usuário atual' });
  });

module.exports = router;