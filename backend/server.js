const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Pasta uploads
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if(!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// Multer setup
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    const userDir = path.join(UPLOADS_DIR, req.body.username);
    if(!fs.existsSync(userDir)) fs.mkdirSync(userDir);
    cb(null, userDir);
  },
  filename: function(req, file, cb){
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// Ler e salvar usuários
const USERS_FILE = path.join(__dirname, 'users.json');

function getUsers(){
  const data = fs.readFileSync(USERS_FILE, 'utf8');
  return JSON.parse(data || '[]');
}

function saveUsers(users){
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ===== ROTAS =====

// Registrar novo usuário
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if(!username || !password) return res.json({ success:false, message:'Preencha todos os campos' });

  const users = getUsers();
  if(users.find(u => u.username === username)) return res.json({ success:false, message:'Usuário já existe' });

  users.push({ username, password });
  saveUsers(users);

  res.json({ success:true, message:'Conta criada com sucesso!' });
});

// Login
app.post('/login', (req,res) => {
  const { username, password } = req.body;
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if(user) res.json({ success:true, message:'Login bem-sucedido' });
  else res.json({ success:false, message:'Usuário ou senha incorretos' });
});

// Upload de arquivo
app.post('/upload', upload.single('file'), (req,res) => {
  if(!req.body.username) return res.json({ success:false, message:'Usuário não informado' });
  if(!req.file) return res.json({ success:false, message:'Nenhum arquivo enviado' });

  res.json({ success:true, message:`Arquivo ${req.file.originalname} enviado com sucesso!` });
});

// Listar arquivos do usuário
app.get('/files', (req,res) => {
  const username = req.query.username;
  if(!username) return res.json({ success:false, files:[] });

  const userDir = path.join(UPLOADS_DIR, username);
  if(!fs.existsSync(userDir)) return res.json({ success:true, files:[] });

  const files = fs.readdirSync(userDir);
  res.json({ success:true, files });
});

// Download de arquivo
app.get('/download/:username/:filename', (req,res) => {
  const { username, filename } = req.params;
  const filePath = path.join(UPLOADS_DIR, username, filename);

  if(fs.existsSync(filePath)){
    res.download(filePath);
  } else {
    res.status(404).send('Arquivo não encontrado');
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
