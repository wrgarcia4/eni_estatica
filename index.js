/* =========================================================
   ENI · Panel Administrativo
   ========================================================= */

/* ---------- Datos semilla ---------- */
const SEED = {
  cursos:[
    {id:1,nombre:"Fundamentos de IA para la formación",tema:"Tecnologías de la Información",perfil:["Planta","Provisional"],modalidad:"Virtual",dur:40,nivel:"Básico",estado:"Activa",desc:""},
    {id:2,nombre:"Didáctica para ambientes virtuales",tema:"Pedagogía y Didáctica",perfil:["Planta","Provisional"],modalidad:"Mixta",dur:60,nivel:"Intermedio",estado:"Activa",desc:""},
    {id:3,nombre:"Seguridad y salud en el trabajo",tema:"Salud y Seguridad",perfil:["Planta"],modalidad:"Presencial",dur:30,nivel:"Básico",estado:"Activa",desc:""},
    {id:4,nombre:"Gestión de proyectos con PMI",tema:"Gestión Empresarial",perfil:["Planta","Provisional"],modalidad:"Virtual",dur:50,nivel:"Avanzado",estado:"Activa",desc:""},
    {id:5,nombre:"Inglés técnico para instructores",tema:"Idiomas",perfil:["Provisional"],modalidad:"Virtual",dur:80,nivel:"Intermedio",estado:"Inactiva",desc:""},
  ],
  instructores:[
    {id:"1010",nombre:"Ana Gómez",correo:"ana.gomez@sena.edu.co",perfil:"Planta",area:"Tecnologías de la Información",estado:"Activo"},
    {id:"2020",nombre:"Luis Pérez",correo:"luis.perez@sena.edu.co",perfil:"Provisional",area:"Pedagogía y Didáctica",estado:"Activo"},
    {id:"3030",nombre:"Marta Ruiz",correo:"marta.ruiz@sena.edu.co",perfil:"Planta",area:"Salud y Seguridad",estado:"Activo"},
  ],
  inscripciones:[
    {id:1,instructor:"Ana Gómez",capacitacion:"Fundamentos de IA para la formación",fecha:"2025-09-15",estado:"Aprobada"},
    {id:2,instructor:"Luis Pérez",capacitacion:"Didáctica para ambientes virtuales",fecha:"2025-09-20",estado:"Pendiente"},
    {id:3,instructor:"Marta Ruiz",capacitacion:"Seguridad y salud en el trabajo",fecha:"2025-10-01",estado:"Aprobada"},
  ]
};

/* ---------- Estado ---------- */
const DB = {
  cursos: JSON.parse(localStorage.getItem('eni_cursos')) || SEED.cursos,
  instructores: JSON.parse(localStorage.getItem('eni_instructores')) || SEED.instructores,
  inscripciones: JSON.parse(localStorage.getItem('eni_inscripciones')) || SEED.inscripciones
};
function guardar(){
  localStorage.setItem('eni_cursos',JSON.stringify(DB.cursos));
  localStorage.setItem('eni_instructores',JSON.stringify(DB.instructores));
  localStorage.setItem('eni_inscripciones',JSON.stringify(DB.inscripciones));
}

/* ---------- Guard de rol ---------- */
(function verificarAcceso(){
  const rol = localStorage.getItem('eni_rol');
  document.getElementById('rolActual').textContent = rol || 'Sin sesión';
  document.getElementById('rolBadge').textContent = rol ? `Rol: ${rol}` : 'Sin sesión';
  if(rol !== 'Administrativo'){
    document.getElementById('accesoDenegado').classList.remove('d-none');
    document.getElementById('panelContent').classList.add('d-none');
    return;
  }
  document.getElementById('panelContent').classList.remove('d-none');
  init();
})();

/* ---------- Init ---------- */
let tablaCursos, tablaInstructores, tablaInscripciones;

function init(){
  renderStats();
  initTablas();
  initNavegacion();
  initFormularios();
  dibujarGraficas();
}

/* ---------- Navegación entre vistas ---------- */
function initNavegacion(){
  document.querySelectorAll('.sidebar .nav-link[data-view]').forEach(link=>{
    link.addEventListener('click',e=>{
      e.preventDefault();
      document.querySelectorAll('.sidebar .nav-link').forEach(l=>l.classList.remove('active'));
      link.classList.add('active');
      const view = link.dataset.view;
      document.querySelectorAll('.view').forEach(v=>v.classList.add('d-none'));
      document.getElementById('view-'+view).classList.remove('d-none');
      document.getElementById('viewTitle').textContent =
        {dashboard:'Dashboard',capacitaciones:'Capacitaciones',instructores:'Instructores',
         inscripciones:'Inscripciones',reportes:'Reportes'}[view];
      document.getElementById('sidebar').classList.remove('open');
    });
  });
}
function toggleSidebar(){ document.getElementById('sidebar').classList.toggle('open'); }

/* ---------- Stats del dashboard ---------- */
function renderStats(){
  document.getElementById('statCap').textContent = DB.cursos.length;
  document.getElementById('statInst').textContent = DB.instructores.length;
  document.getElementById('statIns').textContent = DB.inscripciones.length;
  document.getElementById('statCert').textContent = DB.inscripciones.filter(i=>i.estado==='Aprobada').length;
}

/* ---------- Gráficas ---------- */
let chTemas, chMeses;
function dibujarGraficas(){
  const temas = {};
  DB.cursos.forEach(c=>temas[c.tema]=(temas[c.tema]||0)+1);
  if(chTemas) chTemas.destroy();
  chTemas = new Chart(document.getElementById('chartTemas'),{
    type:'bar',
    data:{labels:Object.keys(temas),datasets:[{label:'Capacitaciones',data:Object.values(temas),backgroundColor:'#39A900'}]},
    options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}
  });

  const meses = {};
  DB.inscripciones.forEach(i=>{
    const m = i.fecha.slice(0,7);
    meses[m]=(meses[m]||0)+1;
  });
  if(chMeses) chMeses.destroy();
  chMeses = new Chart(document.getElementById('chartMeses'),{
    type:'line',
    data:{labels:Object.keys(meses),datasets:[{label:'Inscripciones',data:Object.values(meses),borderColor:'#0d6efd',backgroundColor:'rgba(13,110,253,.15)',fill:true,tension:.3}]},
    options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}
  });
}

/* ---------- Tablas ---------- */
function initTablas(){
  tablaCursos = $('#tablaCursos').DataTable({
    data:DB.cursos,
    columns:[
      {data:'id'},{data:'nombre'},{data:'tema'},
      {data:'perfil',render:d=>d.map(p=>`<span class="badge bg-light text-dark border">${p}</span>`).join(' ')},
      {data:'modalidad'},{data:'dur',render:d=>d+' h'},
      {data:'estado',render:d=>{
        const cls = d==='Activa'?'success':d==='Inactiva'?'secondary':'warning';
        return `<span class="badge bg-${cls}">${d}</span>`;}},
      {data:null,render:d=>`
        <button class="btn btn-sm btn-outline-primary" onclick="editarCurso(${d.id})"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="eliminarCurso(${d.id})"><i class="bi bi-trash"></i></button>`}
    ],
    language:{url:'https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json'},
    pageLength:5
  });

  tablaInstructores = $('#tablaInstructores').DataTable({
    data:DB.instructores,
    columns:[
      {data:'id'},{data:'nombre'},{data:'correo'},
      {data:'perfil',render:d=>`<span class="badge bg-${d==='Planta'?'success':'info'}">${d}</span>`},
      {data:'area'},
      {data:'estado',render:d=>`<span class="badge bg-${d==='Activo'?'success':'secondary'}">${d}</span>`},
      {data:null,render:d=>`
        <button class="btn btn-sm btn-outline-primary" onclick="editarInstructor('${d.id}')"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="eliminarInstructor('${d.id}')"><i class="bi bi-trash"></i></button>`}
    ],
    language:{url:'https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json'},
    pageLength:5
  });

  tablaInscripciones = $('#tablaInscripciones').DataTable({
    data:DB.inscripciones,
    columns:[
      {data:'id'},{data:'instructor'},{data:'capacitacion'},{data:'fecha'},
      {data:'estado',render:d=>{
        const cls = d==='Aprobada'?'success':d==='Pendiente'?'warning':'secondary';
        return `<span class="badge bg-${cls}">${d}</span>`;}},
      {data:null,render:d=>`
        <button class="btn btn-sm btn-outline-success" onclick="aprobarInscripcion(${d.id})"><i class="bi bi-check-circle"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="eliminarInscripcion(${d.id})"><i class="bi bi-x-circle"></i></button>`}
    ],
    language:{url:'https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json'},
    pageLength:5
  });
}

/* ---------- CRUD Cursos ---------- */
function abrirModalCurso(){
  document.getElementById('formCurso').reset();
  document.getElementById('cursoId').value='';
  document.getElementById('tituloModalCurso').textContent='Nueva capacitación';
  new bootstrap.Modal(document.getElementById('modalCurso')).show();
}

function editarCurso(id){
  const c = DB.cursos.find(x=>x.id===id);
  if(!c) return;
  document.getElementById('cursoId').value=c.id;
  document.getElementById('cursoNombre').value=c.nombre;
  document.getElementById('cursoTema').value=c.tema;
  document.getElementById('cursoModalidad').value=c.modalidad;
  document.getElementById('cursoDur').value=c.dur;
  document.getElementById('cursoNivel').value=c.nivel;
  document.getElementById('cursoEstado').value=c.estado;
  document.getElementById('cursoDesc').value=c.desc||'';
  document.getElementById('perfilPlanta').checked = c.perfil.includes('Planta');
  document.getElementById('perfilProv').checked = c.perfil.includes('Provisional');
  document.getElementById('tituloModalCurso').textContent='Editar capacitación';
  new bootstrap.Modal(document.getElementById('modalCurso')).show();
}

function eliminarCurso(id){
  Swal.fire({
    title:'¿Eliminar capacitación?',text:'Esta acción no se puede deshacer.',
    icon:'warning',showCancelButton:true,confirmButtonColor:'#d33',
    cancelButtonText:'Cancelar',confirmButtonText:'Sí, eliminar'
  }).then(r=>{
    if(r.isConfirmed){
      DB.cursos = DB.cursos.filter(c=>c.id!==id);
      guardar(); refrescarCursos(); renderStats(); dibujarGraficas();
      Swal.fire('Eliminada','La capacitación fue eliminada.','success');
    }
  });
}

document.getElementById('formCurso').addEventListener('submit',e=>{
  e.preventDefault();
  const perfil = [];
  if(document.getElementById('perfilPlanta').checked) perfil.push('Planta');
  if(document.getElementById('perfilProv').checked) perfil.push('Provisional');
  if(!perfil.length) return Swal.fire('Atención','Selecciona al menos un perfil.','warning');

  const id = document.getElementById('cursoId').value;
  const data = {
    nombre:document.getElementById('cursoNombre').value,
    tema:document.getElementById('cursoTema').value,
    modalidad:document.getElementById('cursoModalidad').value,
    dur:+document.getElementById('cursoDur').value,
    nivel:document.getElementById('cursoNivel').value,
    estado:document.getElementById('cursoEstado').value,
    desc:document.getElementById('cursoDesc').value,
    perfil
  };
  if(id){
    const idx = DB.cursos.findIndex(c=>c.id===+id);
    DB.cursos[idx] = {...DB.cursos[idx],...data};
  } else {
    const nuevoId = DB.cursos.length ? Math.max(...DB.cursos.map(c=>c.id))+1 : 1;
    DB.cursos.push({id:nuevoId,...data});
  }
  guardar(); refrescarCursos(); renderStats(); dibujarGraficas();
  bootstrap.Modal.getInstance(document.getElementById('modalCurso')).hide();
  document.getElementById('formCurso').reset();
  Swal.fire('Guardado','La capacitación fue guardada correctamente.','success');
});

function refrescarCursos(){
  tablaCursos.clear().rows.add(DB.cursos).draw();
}

/* ---------- CRUD Instructores ---------- */
function abrirModalInstructor(){
  document.getElementById('formInstructor').reset();
  document.getElementById('instructorId').value='';
  document.getElementById('tituloModalInstructor').textContent='Nuevo instructor';
  new bootstrap.Modal(document.getElementById('modalInstructor')).show();
}

function editarInstructor(id){
  const i = DB.instructores.find(x=>x.id===id);
  if(!i) return;
  document.getElementById('instructorId').value=i.id;
  document.getElementById('instructorNombre').value=i.nombre;
  document.getElementById('instructorCorreo').value=i.correo;
  document.getElementById('instructorPerfil').value=i.perfil;
  document.getElementById('instructorArea').value=i.area;
  document.getElementById('instructorEstado').value=i.estado;
  document.getElementById('tituloModalInstructor').textContent='Editar instructor';
  new bootstrap.Modal(document.getElementById('modalInstructor')).show();
}

function eliminarInstructor(id){
  Swal.fire({
    title:'¿Eliminar instructor?',text:'La información será removida del sistema.',
    icon:'warning',showCancelButton:true,confirmButtonColor:'#d33',
    cancelButtonText:'Cancelar',confirmButtonText:'Sí, eliminar'
  }).then(r=>{
    if(r.isConfirmed){
      DB.instructores = DB.instructores.filter(i=>i.id!==id);
      guardar(); refrescarInstructores(); renderStats();
      Swal.fire('Eliminado','El instructor fue eliminado.','success');
    }
  });
}

document.getElementById('formInstructor').addEventListener('submit',e=>{
  e.preventDefault();
  const id = document.getElementById('instructorId').value;
  const data = {
    id: id || crypto.randomUUID().slice(0,8),
    nombre:document.getElementById('instructorNombre').value,
    correo:document.getElementById('instructorCorreo').value,
    perfil:document.getElementById('instructorPerfil').value,
    area:document.getElementById('instructorArea').value,
    estado:document.getElementById('instructorEstado').value
  };

  if(id){
    const idx = DB.instructores.findIndex(i=>i.id===id);
    DB.instructores[idx] = data;
  } else {
    DB.instructores.push(data);
  }
  guardar(); refrescarInstructores(); renderStats();
  bootstrap.Modal.getInstance(document.getElementById('modalInstructor')).hide();
  document.getElementById('formInstructor').reset();
  Swal.fire('Guardado','El instructor fue guardado correctamente.','success');
});

function refrescarInstructores(){
  tablaInstructores.clear().rows.add(DB.instructores).draw();
}

/* ---------- Inscripciones ---------- */
function aprobarInscripcion(id){
  const item = DB.inscripciones.find(i=>i.id===id);
  if(!item) return;
  item.estado = 'Aprobada';
  guardar(); refrescarInscripciones(); renderStats();
  Swal.fire('Actualizada','La inscripción fue aprobada.','success');
}

function eliminarInscripcion(id){
  Swal.fire({
    title:'¿Eliminar inscripción?',
    text:'Se eliminará el registro de la inscripción.',
    icon:'warning',showCancelButton:true,confirmButtonColor:'#d33',
    cancelButtonText:'Cancelar',confirmButtonText:'Sí, eliminar'
  }).then(r=>{
    if(r.isConfirmed){
      DB.inscripciones = DB.inscripciones.filter(i=>i.id!==id);
      guardar(); refrescarInscripciones(); renderStats();
      Swal.fire('Eliminada','La inscripción fue eliminada.','success');
    }
  });
}

function refrescarInscripciones(){
  tablaInscripciones.clear().rows.add(DB.inscripciones).draw();
}

/* ---------- Formulario de filtros / reportes ---------- */
function initFormularios(){
  document.getElementById('btnExport').addEventListener('click',()=>{
    const csv = [
      ['Curso','Tema','Modalidad','Perfil','Duración'],
      ...DB.cursos.map(c=>[c.nombre,c.tema,c.modalidad,c.perfil.join('|'),c.dur+' h'])
    ].map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.download = 'eni_capacitaciones.csv';
    link.click();
  });
}

/* ---------- Cerrar sesión ---------- */
function cerrarSesion(){
  localStorage.removeItem('eni_rol');
  location.reload();
}

/* ---------- Carga inicial ---------- */
window.addEventListener('load',()=>{
  if(document.getElementById('rolActual')) {
    document.getElementById('rolActual').textContent = localStorage.getItem('eni_rol') || 'Sin sesión';
  }
});
