const mongoose = require('mongoose');

const interactionSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['email', 'call', 'meeting', 'note', 'message', 'social_media', 'other'],
      required: [true, 'Por favor informe o tipo de interação'],
    },
    subject: {
      type: String,
      required: [true, 'Por favor informe o assunto da interação'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: Number, // em minutos
      default: null,
    },
    outcome: {
      type: String,
      default: '',
    },
    direction: {
      type: String,
      enum: ['entrada', 'saída', 'não_aplicável'],
      default: 'não_aplicável',
    },
    relatedTo: {
      type: {
        type: String,
        enum: ['customer', 'lead', 'opportunity', 'sale'],
        required: [true, 'Por favor informe a quem esta interação se relaciona'],
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
    contactPerson: {
      name: {
        type: String,
        default: '',
      },
      position: {
        type: String,
        default: '',
      },
      email: {
        type: String,
        default: '',
      },
      phone: {
        type: String,
        default: '',
      },
    },
    location: {
      type: String,
      default: '',
    },
    meetingNotes: {
      type: String,
      default: '',
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    followUpNotes: {
      type: String,
      default: '',
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
    tags: [String],
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
  }
);

// Middleware para validação de relatedTo
interactionSchema.pre('validate', function (next) {
  const relatedType = this.relatedTo.type;
  const relatedId = this.relatedTo[relatedType];
  
  if (!relatedId) {
    const error = new Error(`O ID de ${relatedType} é obrigatório quando o tipo de relação é ${relatedType}`);
    return next(error);
  }
  
  next();
});

// Middleware para criar task de followup automaticamente, se necessário
interactionSchema.post('save', async function (doc) {
  if (doc.followUpRequired && doc.followUpDate) {
    try {
      const Task = mongoose.model('Task');
      
      // Define o título com base no tipo de interação
      let taskTitle;
      switch (doc.type) {
        case 'call':
          taskTitle = `Seguimento de ligação: ${doc.subject}`;
          break;
        case 'meeting':
          taskTitle = `Seguimento de reunião: ${doc.subject}`;
          break;
        case 'email':
          taskTitle = `Seguimento de e-mail: ${doc.subject}`;
          break;
        default:
          taskTitle = `Seguimento: ${doc.subject}`;
      }
      
      // Cria a tarefa de followup
      await Task.create({
        title: taskTitle,
        description: `Tarefa de seguimento criada automaticamente para a interação: ${doc.subject}\n\nNotas de seguimento: ${doc.followUpNotes}`,
        status: 'pendente',
        priority: 'alta',
        dueDate: doc.followUpDate,
        assignedTo: doc.createdBy,
        relatedTo: {
          type: doc.relatedTo.type,
          [doc.relatedTo.type]: doc.relatedTo[doc.relatedTo.type],
        },
        category: 'seguimento',
        createdBy: doc.createdBy,
      });
    } catch (error) {
      console.error('Erro ao criar tarefa de followup:', error);
    }
  }
});

// Índices para melhorar a performance das consultas
interactionSchema.index({ type: 1 });
interactionSchema.index({ date: -1 });
interactionSchema.index({ 'relatedTo.type': 1 });
interactionSchema.index({ 'relatedTo.customer': 1 });
interactionSchema.index({ 'relatedTo.lead': 1 });
interactionSchema.index({ 'relatedTo.opportunity': 1 });
interactionSchema.index({ 'relatedTo.sale': 1 });
interactionSchema.index({ createdBy: 1 });
interactionSchema.index({ followUpRequired: 1, followUpDate: 1 });

const Interaction = mongoose.model('Interaction', interactionSchema);

module.exports = Interaction;