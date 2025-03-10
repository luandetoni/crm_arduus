const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Por favor informe o nome do produto'],
      trim: true,
      unique: true,
    },
    sku: {
      type: String,
      required: [true, 'Por favor informe o SKU do produto'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Por favor informe a categoria do produto'],
    },
    price: {
      type: Number,
      required: [true, 'Por favor informe o preço do produto'],
      default: 0,
      min: 0,
    },
    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'BRL',
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['ativo', 'inativo', 'descontinuado', 'em estoque', 'sem estoque'],
      default: 'ativo',
    },
    images: [
      {
        path: String,
        isMain: {
          type: Boolean,
          default: false,
        },
      },
    ],
    specifications: [
      {
        name: String,
        value: String,
      },
    ],
    stock: {
      quantity: {
        type: Number,
        default: 0,
      },
      lowStockThreshold: {
        type: Number,
        default: 10,
      },
    },
    tags: [String],
    isService: {
      type: Boolean,
      default: false,
    },
    isSubscription: {
      type: Boolean,
      default: false,
    },
    subscriptionDetails: {
      billingCycle: {
        type: String,
        enum: ['mensal', 'trimestral', 'semestral', 'anual'],
        default: 'mensal',
      },
      billingPeriod: {
        type: Number,
        default: 1,
      },
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

// Índices para melhorar a performance das consultas
productSchema.index({ name: 'text', description: 'text', sku: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'stock.quantity': 1 });

// Método para calcular se o produto está com estoque baixo
productSchema.methods.isLowStock = function () {
  return this.stock.quantity <= this.stock.lowStockThreshold;
};

// Método para calcular a margem de lucro
productSchema.methods.getProfitMargin = function () {
  if (this.costPrice === 0) return 0;
  return ((this.price - this.costPrice) / this.price) * 100;
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;