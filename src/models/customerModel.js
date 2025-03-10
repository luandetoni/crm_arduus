const mongoose = require('mongoose');

const customerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Por favor informe o nome do cliente'],
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: ['individual', 'business'],
      default: 'individual',
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
    website: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['ativo', 'inativo', 'potencial', 'perdido'],
      default: 'ativo',
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
    contactPerson: {
      name: {
        type: String,
        default: '',
      },
      position: {
        type: String,
        default: '',
      },
      phone: {
        type: String,
        default: '',
      },
      email: {
        type: String,
        default: '',
      },
    },
    tags: [String],
    notes: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      enum: ['indicação', 'website', 'mídia social', 'mailing', 'evento', 'publicidade', 'outros'],
      default: 'outros',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    documents: [
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

// Virtuals para relacionar oportunidades e vendas com o cliente
customerSchema.virtual('opportunities', {
  ref: 'Opportunity',
  foreignField: 'customer',
  localField: '_id',
});

customerSchema.virtual('sales', {
  ref: 'Sale',
  foreignField: 'customer',
  localField: '_id',
});

customerSchema.virtual('interactions', {
  ref: 'Interaction',
  foreignField: 'customer',
  localField: '_id',
});

// Índices para melhorar a performance das consultas
customerSchema.index({ name: 'text', companyName: 'text', email: 'text' });
customerSchema.index({ status: 1 });
customerSchema.index({ assignedTo: 1 });
customerSchema.index({ createdAt: -1 });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;