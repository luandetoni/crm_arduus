const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Por favor informe o título da notificação'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Por favor informe a mensagem da notificação'],
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error', 'task', 'meeting', 'opportunity', 'lead', 'customer', 'sale'],
      default: 'info',
    },
    priority: {
      type: String,
      enum: ['baixa', 'normal', 'alta', 'urgente'],
      default: 'normal',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    link: {
      type: String,
      default: null,
    },
    relatedTo: {
      model: {
        type: String,
        enum: ['User', 'Customer', 'Lead', 'Opportunity', 'Sale', 'Task', 'Interaction', 'Product', null],
        default: null,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedTo.model',
        default: null,
      },
    },
    expiresAt: {
      type: Date,
      default: function() {
        const date = new Date();
        date.setDate(date.getDate() + 30); // Padrão: expira em 30 dias
        return date;
      },
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Método para marcar como lida
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Método para marcar múltiplas notificações como lidas
notificationSchema.statics.markManyAsRead = function (userId, notificationIds) {
  return this.updateMany(
    {
      user: userId,
      _id: { $in: notificationIds },
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  );
};

// Método para marcar todas as notificações de um usuário como lidas
notificationSchema.statics.markAllAsRead = function (userId) {
  return this.updateMany(
    {
      user: userId,
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  );
};

// Método para remover notificações expiradas
notificationSchema.statics.removeExpired = function () {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
};

// Índices para melhorar a performance das consultas
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, priority: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ 'relatedTo.model': 1, 'relatedTo.id': 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;