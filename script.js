// Base URL do backend Render ou localhost
const BASE_URL = 'https://cloud-saver-x4a2.onrender.com'; // se estiver online, colocar URL do Render

let currentUser = '';
const message = document.getElementById('message');
const uploadMessage = document.getElementById('upload-message');

// Login
document.getElementById('btn-login')?.addEventListener('click', ()=>{
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  fetch(`${BASE_URL}/login`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({username,password})
  })
  .then(res=>res.json())
  .then(data=>{
    if(data.success){
      currentUser = username;
      localStorage.setItem('currentUser',username);
      window.location.href='home.html';
    }else message.textContent = data.message;
  });
});

// Criar Conta
document.getElementById('btn-register')?.addEventListener('click', ()=>{
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;

  fetch(`${BASE_URL}/register`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({username,password})
  })
  .then(res=>res.json())
  .then(data=>{
    message.textContent = data.message;
  });
});

// Home - Atualizar usuário
if(document.getElementById('user-name')){
  const user = localStorage.getItem('currentUser');
  if(user){
    document.getElementById('user-name').textContent = user;
    currentUser = user;
    updateFileList();
  }else window.location.href='index.html';
}

// Upload
document.getElementById('btn-upload')?.addEventListener('click', ()=>{
  const fileInput = document.getElementById('file-input');
  if(fileInput.files.length===0) return;

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('file',file);
  formData.append('username',currentUser);

  fetch(`${BASE_URL}/upload`,{ method:'POST', body:formData })
  .then(res=>res.json())
  .then(data=>{
    uploadMessage.textContent = data.message;
    updateFileList();
  });
});

// Listar arquivos
function updateFileList(){
  fetch(`${BASE_URL}/files?username=${currentUser}`)
  .then(res=>res.json())
  .then(data=>{
    const fileList = document.getElementById('file-list');
    fileList.innerHTML='';
    data.files.forEach(file=>{
      const li=document.createElement('li');
      li.textContent=file;
      const btn=document.createElement('button');
      btn.textContent='Baixar';
      btn.onclick=()=>window.location.href=`${BASE_URL}/download/${currentUser}/${file}`;
      li.appendChild(btn);
      fileList.appendChild(li);
    });
  });
}
