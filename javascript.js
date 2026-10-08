function login(rol){
  localStorage.setItem('eni_rol', rol);
  if(rol === 'Administrativo'){
    window.location.href = 'admin.html';
    return;
  }
  if(rol === 'Operativo'){
    window.location.href = 'operativo.html';
    return;
  }
  bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
  actualizarSesion();
}