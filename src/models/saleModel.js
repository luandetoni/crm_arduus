const mongoose = require('mongoose');

const saleSchema = mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Por favor informe o cliente'],
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      default: null,
    },
    saleDate: {
      type: Date,
      required: [true, 'Por favor informe a data da venda'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['rascunho', 'pendente', 'pago', 'enviado', 'entregue', 'cancelado', 'reembolsado'],
      default: 'rascunho',
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
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
        tax: {
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
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discountTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'BRL',
    },
    paymentMethod: {
      type: String,
      enum: ['dinheiro', 'cartão_de_crédito', 'cartão_de_débito', 'transferência_bancária', 'boleto', 'pix', 'outro'],
      default: 'pix',
    },
    paymentStatus: {
      type: String,
      enum: ['pendente', 'parcial', 'pago', 'atrasado', 'reembolsado', 'cancelado'],
      default: 'pendente',
    },
    paymentDueDate: {
      type: Date,
      default: function() {
        const dueDate = new Date(this.saleDate);
        dueDate.setDate(dueDate.getDate() + 30); // Padrão 30 dias de prazo
        return dueDate;
      },
    },
    paymentInstallments: {
      type: Number,
      default: 1,
      min: 1,
    },
    payments: [
      {
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        method: {
          type: String,
          enum: ['dinheiro', 'cartão_de_crédito', 'cartão_de_débito', 'transferência_bancária', 'boleto', 'pix', 'outro'],
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        reference: {
          type: String,
          default: '',
        },
        notes: {
          type: String,
          default: '',
        },
      },
    ],
    shippingAddress: {
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
    billingAddress: {
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
    shippingMethod: {
      type: String,
      default: '',
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    termsAndConditions: {
      type: String,
      default: '',
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
    tags: [String],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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

// Gerar número único de venda antes de salvar
saleSchema.pre('save', async function (next) {
  if (!this.number) {
    const count = await mongoose.model('Sale').countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    this.number = `VND-${year}${month}-${(count + 1).toString().padStart(5, '0')}`;
  }
  next();
});

// Calcular os totais antes de salvar
saleSchema.pre('save', function (next) {
  // Recalcular o total de cada item
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  this.items.forEach((item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const itemDiscount = (itemSubtotal * item.discount) / 100;
    const itemTax = ((itemSubtotal - itemDiscount) * item.tax) / 100;
    
    item.total = itemSubtotal - itemDiscount + itemTax;
    
    subtotal += itemSubtotal;
    discountTotal += itemDiscount;
    taxTotal += itemTax;
  });

  this.subtotal = subtotal;
  this.discountTotal = discountTotal;
  this.taxTotal = taxTotal;
  this.total = subtotal - discountTotal + taxTotal + this.shippingCost;

  next();
});

// Índices para melhorar a performance das consultas
saleSchema.index({ number: 1 }, { unique: true });
saleSchema.index({ customer: 1 });
saleSchema.index({ opportunity: 1 });
saleSchema.index({ saleDate: -1 });
saleSchema.index({ status: 1 });
saleSchema.index({ paymentStatus: 1 });
saleSchema.index({ paymentDueDate: 1 });
saleSchema.index({ assignedTo: 1 });

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;