const express = require('express');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserAvatar,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Todas as rotas são protegidas e algumas requerem permissão de administrador
router.route('/')
  .get(protect, authorize('admin', 'manager'), getUsers)
  .post(protect, authorize('admin'), createUser);

router.route('/:id')
  .get(protect, authorize('admin', 'manager'), getUserById)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

router.route('/:id/avatar')
  .put(
    protect,
    authorize('admin', 'user'),
    upload.single('avatar'),
    updateUserAvatar
  );

module.exports = router;