const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear carpeta uploads si no existe
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const nombre = `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
    cb(null, nombre);
  }
});

const fileFilter = (req, file, cb) => {
  const tipos = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (tipos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes y PDF'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB máximo
});

const subirArchivo = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }
  const url = `http://localhost:3000/uploads/${req.file.filename}`;
  res.json({
    mensaje: 'Archivo subido correctamente',
    url,
    nombre: req.file.originalname,
    tipo: req.file.mimetype,
  });
};

module.exports = { upload, subirArchivo };