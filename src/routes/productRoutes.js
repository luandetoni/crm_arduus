const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Todas as rotas são protegidas
router.use(protect);

router.route('/')
  .get((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para obter todos os produtos' });
  })
  .post(authorize('admin', 'manager'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para criar produto' });
  });

router.route('/:id')
  .get((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para obter produto com ID ${req.params.id}` });
  })
  .put(authorize('admin', 'manager'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para atualizar produto com ID ${req.params.id}` });
  })
  .delete(authorize('admin', 'manager'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para excluir produto com ID ${req.params.id}` });
  });

router.route('/:id/images')
  .post(authorize('admin', 'manager'), upload.single('image'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para adicionar imagem ao produto com ID ${req.params.id}` });
  })
  .delete(authorize('admin', 'manager'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para excluir imagem do produto com ID ${req.params.id}` });
  });

router.route('/categories')
  .get((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para obter todas as categorias de produtos' });
  });

router.route('/low-stock')
  .get(authorize('admin', 'manager'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para obter produtos com estoque baixo' });
  });

module.exports = router;