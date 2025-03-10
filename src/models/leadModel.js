const mongoose = require('mongoose');

const leadSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Por favor informe o nome do lead'],
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Por favor informe um e-mail'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'E-mail inválido'],
    },
    phone: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      enum: ['indicação', 'website', 'mídia social', 'mailing', 'evento', 'publicidade', 'outros'],
      default: 'outros',
    },
    status: {
      type: String,
      enum: ['novo', 'contatado', 'qualificado', 'não-qualificado', 'convertido'],
      default: 'novo',
    },
    industry: {
      type: String,
      default: '',
    },
    jobTitle: {
      type: String,
      default: '',
    },
    address: {
      street: {
        type: String,
        default: '',
      },
      city: {
        type: String,
        default: '',
      },
      state: {
        type: String,
        default: '',
      },
      zipCode: {
        type: String,
        default: '',
      },
      country: {
        type: String,
        default: 'Brasil',
      },
    },
    interestLevel: {
      type: String,
      enum: ['baixo', 'médio', 'alto'],
      default: 'médio',
    },
    notes: {
      type: String,
      default: '',
    },
    tags: [String],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lastContact: {
      type: Date,
      default: null,
    },
    nextFollowUp: {
      type: Date,
      default: null,
    },
    convertedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    convertedAt: {
      type: Date,
      default: null,
    },
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

// Virtuals para relacionar interações
leadSchema.virtual('interactions', {
  ref: 'Interaction',
  foreignField: 'lead',
  localField: '_id',
});

// Índices para melhorar a performance das consultas
leadSchema.index({ name: 'text', companyName: 'text', email: 'text' });
leadSchema.index({ status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ nextFollowUp: 1 });

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;