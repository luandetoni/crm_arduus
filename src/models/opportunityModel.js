const mongoose = require('mongoose');

const opportunitySchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Por favor informe o título da oportunidade'],
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Por favor informe o cliente'],
    },
    stage: {
      type: String,
      enum: ['prospecção', 'qualificação', 'proposta', 'negociação', 'fechada ganha', 'fechada perdida'],
      default: 'prospecção',
    },
    value: {
      type: Number,
      required: [true, 'Por favor informe o valor da oportunidade'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'BRL',
    },
    probability: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    expectedCloseDate: {
      type: Date,
      required: [true, 'Por favor informe a data de fechamento esperada'],
    },
    actualCloseDate: {
      type: Date,
      default: null,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        discount: {
          type: Number,
          default: 0,
          min: 0,
        },
        total: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    description: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      enum: ['indicação', 'website', 'mídia social', 'mailing', 'evento', 'publicidade', 'outros'],
      default: 'outros',
    },
    tags: [String],
    priority: {
      type: String,
      enum: ['baixa', 'média', 'alta'],
      default: 'média',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
    reasonLost: {
      type: String,
      default: '',
    },
    competitors: [
      {
        name: String,
        strengths: String,
        weaknesses: String,
      },
    ],
    activities: [
      {
        type: {
          type: String,
          enum: ['call', 'meeting', 'email', 'task', 'note'],
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        description: String,
        date: {
          type: Date,
          default: Date.now,
        },
        duration: Number, // em minutos
        outcome: String,
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
      },
    ],
    documents: [
      {
        name: String,
        path: String,
        type: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
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

// Virtuals
opportunitySchema.virtual('expectedRevenue').get(function () {
  return (this.value * this.probability) / 100;
});

opportunitySchema.virtual('daysOpen').get(function () {
  const now = this.stage === 'fechada ganha' || this.stage === 'fechada perdida'
    ? new Date(this.actualCloseDate)
    : new Date();
  const createdDate = new Date(this.createdAt);
  const diff = now - createdDate;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

opportunitySchema.virtual('daysUntilClose').get(function () {
  if (this.stage === 'fechada ganha' || this.stage === 'fechada perdida') {
    return 0;
  }
  const now = new Date();
  const closeDate = new Date(this.expectedCloseDate);
  const diff = closeDate - now;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

opportunitySchema.virtual('isOverdue').get(function () {
  if (this.stage === 'fechada ganha' || this.stage === 'fechada perdida') {
    return false;
  }
  return new Date() > new Date(this.expectedCloseDate);
});

// Middleware para atualizar o valor total quando os produtos forem modificados
opportunitySchema.pre('save', function (next) {
  if (this.products && this.products.length > 0) {
    let totalValue = 0;
    this.products.forEach((product) => {
      // Recalcula o total para cada linha de produto
      product.total = product.quantity * product.unitPrice * (1 - product.discount / 100);
      totalValue += product.total;
    });
    this.value = totalValue;
  }
  next();
});

// Índices para melhorar a performance das consultas
opportunitySchema.index({ stage: 1 });
opportunitySchema.index({ customer: 1 });
opportunitySchema.index({ assignedTo: 1 });
opportunitySchema.index({ expectedCloseDate: 1 });
opportunitySchema.index({ createdAt: -1 });
opportunitySchema.index({ value: -1 });

const Opportunity = mongoose.model('Opportunity', opportunitySchema);

module.exports = Opportunity;