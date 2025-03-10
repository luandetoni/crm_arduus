const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    
    // Verificar se o diretório existe, se não, criar
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

// Filtro de arquivos
const fileFilter = (req, file, cb) => {
  // Tipos de arquivo permitidos
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|csv/;
  
  // Verificar extensão
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Verificar mimetype
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado! Apenas jpeg, jpg, png, gif, pdf, doc, docx, xls, xlsx e csv são permitidos.'));
  }
};

// Configurar upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

module.exports = upload;