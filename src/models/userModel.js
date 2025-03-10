const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Por favor informe um nome'],
    },
    email: {
      type: String,
      required: [true, 'Por favor informe um e-mail'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'E-mail inválido'],
    },
    password: {
      type: String,
      required: [true, 'Por favor informe uma senha'],
      minlength: [6, 'A senha deve ter pelo menos 6 caracteres'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'sales', 'support', 'user'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      enum: ['vendas', 'marketing', 'suporte', 'administrativo', 'tecnologia', 'outros'],
      default: 'outros',
    },
    jobTitle: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Encriptar senha antes de salvar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para verificar senha
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Método para gerar token de redefinição de senha
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutos

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;