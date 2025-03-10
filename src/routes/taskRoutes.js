const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Todas as rotas são protegidas
router.use(protect);

router.route('/')
  .get((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para obter todas as tarefas' });
  })
  .post((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para criar tarefa' });
  });

router.route('/:id')
  .get((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para obter tarefa com ID ${req.params.id}` });
  })
  .put((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para atualizar tarefa com ID ${req.params.id}` });
  })
  .delete((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para excluir tarefa com ID ${req.params.id}` });
  });

router.route('/:id/status')
  .put((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para atualizar status da tarefa com ID ${req.params.id}` });
  });

router.route('/:id/complete')
  .put((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para marcar tarefa com ID ${req.params.id} como concluída` });
  });

router.route('/:id/attachments')
  .post(upload.single('attachment'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para adicionar anexo à tarefa com ID ${req.params.id}` });
  });

router.route('/overdue')
  .get((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para obter tarefas atrasadas' });
  });

router.route('/upcoming')
  .get((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para obter tarefas próximas' });
  });

router.route('/user/:userId')
  .get((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para obter tarefas do usuário com ID ${req.params.userId}` });
  });

module.exports = router;