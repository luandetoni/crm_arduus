const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Todas as rotas são protegidas
router.use(protect);

router.route('/')
  .get((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para obter todas as oportunidades' });
  })
  .post((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para criar oportunidade' });
  });

router.route('/:id')
  .get((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para obter oportunidade com ID ${req.params.id}` });
  })
  .put((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para atualizar oportunidade com ID ${req.params.id}` });
  })
  .delete((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para excluir oportunidade com ID ${req.params.id}` });
  });

router.route('/:id/products')
  .post((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para adicionar produto à oportunidade com ID ${req.params.id}` });
  })
  .put((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para atualizar produtos da oportunidade com ID ${req.params.id}` });
  });

router.route('/:id/stage')
  .put((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para atualizar estágio da oportunidade com ID ${req.params.id}` });
  });

router.route('/:id/activities')
  .get((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para obter atividades da oportunidade com ID ${req.params.id}` });
  })
  .post((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para adicionar atividade à oportunidade com ID ${req.params.id}` });
  });

router.route('/:id/documents')
  .post(upload.single('document'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para adicionar documento à oportunidade com ID ${req.params.id}` });
  });

router.route('/:id/convert')
  .post((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para converter oportunidade com ID ${req.params.id} em venda` });
  });

module.exports = router;