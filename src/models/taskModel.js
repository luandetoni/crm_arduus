const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Por favor informe o título da tarefa'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pendente', 'em_andamento', 'concluída', 'cancelada', 'atrasada'],
      default: 'pendente',
    },
    priority: {
      type: String,
      enum: ['baixa', 'média', 'alta', 'urgente'],
      default: 'média',
    },
    dueDate: {
      type: Date,
      required: [true, 'Por favor informe a data de vencimento'],
    },
    completedAt: {
      type: Date,
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Por favor atribua um responsável para a tarefa'],
    },
    relatedTo: {
      type: {
        type: String,
        enum: ['customer', 'lead', 'opportunity', 'sale', 'none'],
        default: 'none',
      },
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        default: null,
      },
      lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        default: null,
      },
      opportunity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Opportunity',
        default: null,
      },
      sale: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sale',
        default: null,
      },
    },
    reminder: {
      isSet: {
        type: Boolean,
        default: false,
      },
      time: {
        type: Date,
        default: null,
      },
      sent: {
        type: Boolean,
        default: false,
      },
    },
    category: {
      type: String,
      enum: ['ligação', 'reunião', 'e-mail', 'visita', 'apresentação', 'seguimento', 'administrativo', 'outro'],
      default: 'outro',
    },
    recurrence: {
      isRecurring: {
        type: Boolean,
        default: false,
      },
      frequency: {
        type: String,
        enum: ['diária', 'semanal', 'mensal', 'anual'],
        default: 'semanal',
      },
      interval: {
        type: Number,
        default: 1,
        min: 1,
      },
      endDate: {
        type: Date,
        default: null,
      },
      daysOfWeek: [
        {
          type: Number,
          enum: [0, 1, 2, 3, 4, 5, 6], // Domingo a Sábado
        },
      ],
    },
    attachments: [
      {
        name: String,
        path: String,
        type: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notes: {
      type: String,
      default: '',
    },
    outcome: {
      type: String,
      default: '',
    },
    duration: {
      planned: {
        type: Number, // em minutos
        default: 30,
      },
      actual: {
        type: Number, // em minutos
        default: null,
      },
    },
    location: {
      type: String,
      default: '',
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
taskSchema.virtual('isOverdue').get(function () {
  if (this.status === 'concluída' || this.status === 'cancelada') {
    return false;
  }
  return new Date() > new Date(this.dueDate);
});

taskSchema.virtual('daysUntilDue').get(function () {
  if (this.status === 'concluída' || this.status === 'cancelada') {
    return 0;
  }
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  const diff = dueDate - now;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Middleware para atualizar o status 'atrasada' automaticamente
taskSchema.pre('save', function (next) {
  if (this.status !== 'concluída' && this.status !== 'cancelada') {
    if (new Date() > new Date(this.dueDate)) {
      this.status = 'atrasada';
    }
  }
  
  if (this.status === 'concluída' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  if (this.status !== 'concluída') {
    this.completedAt = null;
  }
  
  next();
});

// Índices para melhorar a performance das consultas
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ 'relatedTo.customer': 1 });
taskSchema.index({ 'relatedTo.lead': 1 });
taskSchema.index({ 'relatedTo.opportunity': 1 });
taskSchema.index({ 'relatedTo.sale': 1 });
taskSchema.index({ 'reminder.time': 1, 'reminder.isSet': 1, 'reminder.sent': 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;