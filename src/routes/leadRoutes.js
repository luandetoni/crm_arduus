const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Todas as rotas são protegidas
router.use(protect);

router.route('/')
  .get((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para obter todos os leads' });
  })
  .post((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para criar lead' });
  });

router.route('/:id')
  .get((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para obter lead com ID ${req.params.id}` });
  })
  .put((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para atualizar lead com ID ${req.params.id}` });
  })
  .delete((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para excluir lead com ID ${req.params.id}` });
  });

router.post('/:id/convert', (req, res) => {
  // Placeholder para implementação futura
  res.json({ message: `Rota para converter lead com ID ${req.params.id} para cliente` });
});

router.route('/:id/interactions')
  .get((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para obter interações do lead com ID ${req.params.id}` });
  });

router.route('/:id/documents')
  .post(upload.single('document'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para adicionar documento ao lead com ID ${req.params.id}` });
  });

module.exports = router;