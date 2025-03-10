const express = require('express');
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addCustomerDocument,
  getCustomerInteractions,
  getCustomerOpportunities,
  getCustomerSales,
} = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Todas as rotas são protegidas
router.use(protect);

router.route('/')
  .get(getCustomers)
  .post(createCustomer);

router.route('/:id')
  .get(getCustomerById)
  .put(updateCustomer)
  .delete(authorize('admin', 'manager'), deleteCustomer);

router.route('/:id/documents')
  .post(upload.single('document'), addCustomerDocument);

router.route('/:id/interactions')
  .get(getCustomerInteractions);

router.route('/:id/opportunities')
  .get(getCustomerOpportunities);

router.route('/:id/sales')
  .get(getCustomerSales);

module.exports = router;