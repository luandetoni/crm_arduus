const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Todas as rotas são protegidas
router.use(protect);

router.route('/sales')
  .get(authorize('admin', 'manager'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para gerar relatório de vendas' });
  });

router.route('/sales/by-period')
  .get(authorize('admin', 'manager'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para gerar relatório de vendas por período' });
  });

router.route('/sales/by-product')
  .get(authorize('admin', 'manager'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para gerar relatório de vendas por produto' });
  });

router.route('/sales/by-customer')
  .get(authorize('admin', 'manager'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para gerar relatório de vendas por cliente' });
  });

router.route('/sales/by-salesperson')
  .get(authorize('admin', 'manager'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para gerar relatório de vendas por vendedor' });
  });

router.route('/leads')
  .get(authorize('admin', 'manager'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para gerar relatório de leads' });
  });

router.route('/leads/conversion')
  .get(authorize('admin', 'manager'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para gerar relatório de conversão de leads' });
  });

router.route('/opportunities')
  .get(authorize('admin', 'manager'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para gerar relatório de oportunidades' });
  });

router.route('/opportunities/pipeline')
  .get(authorize('admin', 'manager'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para gerar relatório de pipeline de oportunidades' });
  });

router.route('/customers')
  .get(authorize('admin', 'manager'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para gerar relatório de clientes' });
  });

router.route('/customers/activity')
  .get(authorize('admin', 'manager'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para gerar relatório de atividade de clientes' });
  });

router.route('/tasks')
  .get(authorize('admin', 'manager'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para gerar relatório de tarefas' });
  });

router.route('/export/:type')
  .get(authorize('admin', 'manager'), (req, res) => {
    // Placeholder para implementação futura
    res.json({ message: `Rota para exportar relatório em formato ${req.params.type}` });
  });

router.route('/dashboard')
  .get((req, res) => {
    // Placeholder para implementação futura
    res.json({ message: 'Rota para obter dados do dashboard' });
  });

module.exports = router;