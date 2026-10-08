/* =========================================================
   ENI · Panel Administrativo
   ========================================================= */

(function () {
  const panelContent = document.getElementById('panelContent');
  const accesoDenegado = document.getElementById('accesoDenegado');
  const rolActual = document.getElementById('rolActual');

  if (!panelContent || !accesoDenegado || !rolActual) {
    return;
  }

  const SEED = {
    cursos: [
      { id: 1, nombre: 'Fundamentos de IA para la formación', tema: 'Tecnologías de la Información', perfil: ['Planta', 'Provisional'], modalidad: 'Virtual', dur: 40, nivel: 'Básico', estado: 'Activa', desc: '' },
      { id: 2, nombre: 'Didáctica para ambientes virtuales', tema: 'Pedagogía y Didáctica', perfil: ['Planta', 'Provisional'], modalidad: 'Mixta', dur: 60, nivel: 'Intermedio', estado: 'Activa', desc: '' },
      { id: 3, nombre: 'Seguridad y salud en el trabajo', tema: 'Salud y Seguridad', perfil: ['Planta'], modalidad: 'Presencial', dur: 30, nivel: 'Básico', estado: 'Activa', desc: '' },
      { id: 4, nombre: 'Gestión de proyectos con PMI', tema: 'Gestión Empresarial', perfil: ['Planta', 'Provisional'], modalidad: 'Virtual', dur: 50, nivel: 'Avanzado', estado: 'Activa', desc: '' },
      { id: 5, nombre: 'Inglés técnico para instructores', tema: 'Idiomas', perfil: ['Provisional'], modalidad: 'Virtual', dur: 80, nivel: 'Intermedio', estado: 'Inactiva', desc: '' }
    ],
    instructores: [
      { id: '1010', nombre: 'Ana Gómez', correo: 'ana.gomez@sena.edu.co', perfil: 'Planta', area: 'Tecnologías de la Información', estado: 'Activo' },
      { id: '2020', nombre: 'Luis Pérez', correo: 'luis.perez@sena.edu.co', perfil: 'Provisional', area: 'Pedagogía y Didáctica', estado: 'Activo' },
      { id: '3030', nombre: 'Marta Ruiz', correo: 'marta.ruiz@sena.edu.co', perfil: 'Planta', area: 'Salud y Seguridad', estado: 'Activo' }
    ],
    inscripciones: [
      { id: 1, instructor: 'Ana Gómez', capacitacion: 'Fundamentos de IA para la formación', fecha: '2025-09-15', estado: 'Aprobada' },
      { id: 2, instructor: 'Luis Pérez', capacitacion: 'Didáctica para ambientes virtuales', fecha: '2025-09-20', estado: 'Pendiente' },
      { id: 3, instructor: 'Marta Ruiz', capacitacion: 'Seguridad y salud en el trabajo', fecha: '2025-10-01', estado: 'Aprobada' }
    ]
  };

  const DB = {
    cursos: JSON.parse(localStorage.getItem('eni_cursos')) || SEED.cursos,
    instructores: JSON.parse(localStorage.getItem('eni_instructores')) || SEED.instructores,
    inscripciones: JSON.parse(localStorage.getItem('eni_inscripciones')) || SEED.inscripciones
  };

  function guardar() {
    localStorage.setItem('eni_cursos', JSON.stringify(DB.cursos));
    localStorage.setItem('eni_instructores', JSON.stringify(DB.instructores));
    localStorage.setItem('eni_inscripciones', JSON.stringify(DB.inscripciones));
  }

  function verificarAcceso() {
    const rol = localStorage.getItem('eni_rol');
    rolActual.textContent = rol || 'Sin sesión';
    const rolBadge = document.getElementById('rolBadge');
    if (rolBadge) rolBadge.textContent = rol ? `Rol: ${rol}` : 'Sin sesión';

    if (rol !== 'Administrativo') {
      accesoDenegado.classList.remove('d-none');
      panelContent.classList.add('d-none');
      return false;
    }

    panelContent.classList.remove('d-none');
    return true;
  }

  let tablaCursos;
  let tablaInstructores;
  let tablaInscripciones;

  function init() {
    renderStats();
    initTablas();
    initNavegacion();
    initFormularios();
    dibujarGraficas();
  }

  function initNavegacion() {
    document.querySelectorAll('.sidebar .nav-link[data-view]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        document.querySelectorAll('.sidebar .nav-link').forEach((item) => item.classList.remove('active'));
        link.classList.add('active');

        const view = link.dataset.view;
        document.querySelectorAll('.view').forEach((element) => element.classList.add('d-none'));
        const target = document.getElementById('view-' + view);
        if (target) target.classList.remove('d-none');

        const title = document.getElementById('viewTitle');
        if (title) {
          title.textContent = {
            dashboard: 'Dashboard',
            capacitaciones: 'Capacitaciones',
            instructores: 'Instructores',
            inscripciones: 'Inscripciones',
            reportes: 'Reportes'
          }[view];
        }

        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('open');
      });
    });
  }

  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('open');
  }

  function renderStats() {
    const statCap = document.getElementById('statCap');
    const statInst = document.getElementById('statInst');
    const statIns = document.getElementById('statIns');
    const statCert = document.getElementById('statCert');

    if (statCap) statCap.textContent = DB.cursos.length;
    if (statInst) statInst.textContent = DB.instructores.length;
    if (statIns) statIns.textContent = DB.inscripciones.length;
    if (statCert) statCert.textContent = DB.inscripciones.filter((item) => item.estado === 'Aprobada').length;
  }

  let chTemas;
  let chMeses;

  function dibujarGraficas() {
    const chartTemas = document.getElementById('chartTemas');
    if (chartTemas) {
      const temas = {};
      DB.cursos.forEach((curso) => {
        temas[curso.tema] = (temas[curso.tema] || 0) + 1;
      });

      if (chTemas) chTemas.destroy();
      chTemas = new Chart(chartTemas, {
        type: 'bar',
        data: {
          labels: Object.keys(temas),
          datasets: [{ label: 'Capacitaciones', data: Object.values(temas), backgroundColor: '#39A900' }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      });
    }

    const chartMeses = document.getElementById('chartMeses');
    if (chartMeses) {
      const meses = {};
      DB.inscripciones.forEach((inscripcion) => {
        const mes = inscripcion.fecha.slice(0, 7);
        meses[mes] = (meses[mes] || 0) + 1;
      });

      if (chMeses) chMeses.destroy();
      chMeses = new Chart(chartMeses, {
        type: 'line',
        data: {
          labels: Object.keys(meses),
          datasets: [{ label: 'Inscripciones', data: Object.values(meses), borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,.15)', fill: true, tension: 0.3 }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      });
    }
  }

  function initTablas() {
    const tablaCursosNode = document.getElementById('tablaCursos');
    const tablaInstructoresNode = document.getElementById('tablaInstructores');
    const tablaInscripcionesNode = document.getElementById('tablaInscripciones');

    if (tablaCursosNode && window.$) {
      tablaCursos = $(tablaCursosNode).DataTable({
        data: DB.cursos,
        columns: [
          { data: 'id' },
          { data: 'nombre' },
          { data: 'tema' },
          { data: 'perfil', render: (d) => d.map((p) => `<span class="badge bg-light text-dark border">${p}</span>`).join(' ') },
          { data: 'modalidad' },
          { data: 'dur', render: (d) => d + ' h' },
          { data: 'estado', render: (d) => `<span class="badge bg-${d === 'Activa' ? 'success' : d === 'Inactiva' ? 'secondary' : 'warning'}">${d}</span>` },
          { data: null, render: (d) => `<button class="btn btn-sm btn-outline-primary" onclick="editarCurso(${d.id})"><i class="bi bi-pencil"></i></button> <button class="btn btn-sm btn-outline-danger" onclick="eliminarCurso(${d.id})"><i class="bi bi-trash"></i></button>` }
        ],
        language: { url: 'https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json' },
        pageLength: 5
      });
    }

    if (tablaInstructoresNode && window.$) {
      tablaInstructores = $(tablaInstructoresNode).DataTable({
        data: DB.instructores,
        columns: [
          { data: 'id' },
          { data: 'nombre' },
          { data: 'correo' },
          { data: 'perfil', render: (d) => `<span class="badge bg-${d === 'Planta' ? 'success' : 'info'}">${d}</span>` },
          { data: 'area' },
          { data: 'estado', render: (d) => `<span class="badge bg-${d === 'Activo' ? 'success' : 'secondary'}">${d}</span>` },
          { data: null, render: (d) => `<button class="btn btn-sm btn-outline-primary" onclick="editarInstructor('${d.id}')"><i class="bi bi-pencil"></i></button> <button class="btn btn-sm btn-outline-danger" onclick="eliminarInstructor('${d.id}')"><i class="bi bi-trash"></i></button>` }
        ],
        language: { url: 'https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json' },
        pageLength: 5
      });
    }

    if (tablaInscripcionesNode && window.$) {
      tablaInscripciones = $(tablaInscripcionesNode).DataTable({
        data: DB.inscripciones,
        columns: [
          { data: 'id' },
          { data: 'instructor' },
          { data: 'capacitacion' },
          { data: 'fecha' },
          { data: 'estado', render: (d) => `<span class="badge bg-${d === 'Aprobada' ? 'success' : d === 'Pendiente' ? 'warning' : 'secondary'}">${d}</span>` },
          { data: null, render: (d) => `<button class="btn btn-sm btn-outline-success" onclick="aprobarInscripcion(${d.id})"><i class="bi bi-check-circle"></i></button> <button class="btn btn-sm btn-outline-danger" onclick="eliminarInscripcion(${d.id})"><i class="bi bi-x-circle"></i></button>` }
        ],
        language: { url: 'https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json' },
        pageLength: 5
      });
    }
  }

  function abrirModalCurso() {
    const form = document.getElementById('formCurso');
    const modal = document.getElementById('modalCurso');
    if (!form || !modal) return;
    form.reset();
    document.getElementById('cursoId').value = '';
    document.getElementById('tituloModalCurso').textContent = 'Nueva capacitación';
    new bootstrap.Modal(modal).show();
  }

  function editarCurso(id) {
    const curso = DB.cursos.find((item) => item.id === id);
    if (!curso) return;

    document.getElementById('cursoId').value = curso.id;
    document.getElementById('cursoNombre').value = curso.nombre;
    document.getElementById('cursoTema').value = curso.tema;
    document.getElementById('cursoModalidad').value = curso.modalidad;
    document.getElementById('cursoDur').value = curso.dur;
    document.getElementById('cursoNivel').value = curso.nivel;
    document.getElementById('cursoEstado').value = curso.estado;
    document.getElementById('cursoDesc').value = curso.desc || '';
    document.getElementById('perfilPlanta').checked = curso.perfil.includes('Planta');
    document.getElementById('perfilProv').checked = curso.perfil.includes('Provisional');
    document.getElementById('tituloModalCurso').textContent = 'Editar capacitación';
    new bootstrap.Modal(document.getElementById('modalCurso')).show();
  }

  function eliminarCurso(id) {
    Swal.fire({
      title: '¿Eliminar capacitación?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        DB.cursos = DB.cursos.filter((curso) => curso.id !== id);
        guardar();
        refrescarCursos();
        renderStats();
        dibujarGraficas();
        Swal.fire('Eliminada', 'La capacitación fue eliminada.', 'success');
      }
    });
  }

  const formCurso = document.getElementById('formCurso');
  if (formCurso) {
    formCurso.addEventListener('submit', (event) => {
      event.preventDefault();
      const perfil = [];
      if (document.getElementById('perfilPlanta').checked) perfil.push('Planta');
      if (document.getElementById('perfilProv').checked) perfil.push('Provisional');
      if (!perfil.length) return Swal.fire('Atención', 'Selecciona al menos un perfil.', 'warning');

      const id = document.getElementById('cursoId').value;
      const data = {
        nombre: document.getElementById('cursoNombre').value,
        tema: document.getElementById('cursoTema').value,
        modalidad: document.getElementById('cursoModalidad').value,
        dur: +document.getElementById('cursoDur').value,
        nivel: document.getElementById('cursoNivel').value,
        estado: document.getElementById('cursoEstado').value,
        desc: document.getElementById('cursoDesc').value,
        perfil
      };

      if (id) {
        const index = DB.cursos.findIndex((curso) => curso.id === +id);
        DB.cursos[index] = { ...DB.cursos[index], ...data };
      } else {
        const nuevoId = DB.cursos.length ? Math.max(...DB.cursos.map((curso) => curso.id)) + 1 : 1;
        DB.cursos.push({ id: nuevoId, ...data });
      }

      guardar();
      refrescarCursos();
      renderStats();
      dibujarGraficas();
      bootstrap.Modal.getInstance(document.getElementById('modalCurso')).hide();
      formCurso.reset();
      Swal.fire('Guardado', 'La capacitación fue guardada correctamente.', 'success');
    });
  }

  function refrescarCursos() {
    if (tablaCursos) {
      tablaCursos.clear().rows.add(DB.cursos).draw();
    }
  }

  function abrirModalInstructor() {
    const form = document.getElementById('formInstructor');
    const modal = document.getElementById('modalInstructor');
    if (!form || !modal) return;
    form.reset();
    document.getElementById('instructorId').value = '';
    document.getElementById('tituloModalInstructor').textContent = 'Nuevo instructor';
    new bootstrap.Modal(modal).show();
  }

  function editarInstructor(id) {
    const instructor = DB.instructores.find((item) => item.id === id);
    if (!instructor) return;
    document.getElementById('instructorId').value = instructor.id;
    document.getElementById('instructorNombre').value = instructor.nombre;
    document.getElementById('instructorCorreo').value = instructor.correo;
    document.getElementById('instructorPerfil').value = instructor.perfil;
    document.getElementById('instructorArea').value = instructor.area;
    document.getElementById('instructorEstado').value = instructor.estado;
    document.getElementById('tituloModalInstructor').textContent = 'Editar instructor';
    new bootstrap.Modal(document.getElementById('modalInstructor')).show();
  }

  function eliminarInstructor(id) {
    Swal.fire({
      title: '¿Eliminar instructor?',
      text: 'La información será removida del sistema.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        DB.instructores = DB.instructores.filter((instructor) => instructor.id !== id);
        guardar();
        refrescarInstructores();
        renderStats();
        Swal.fire('Eliminado', 'El instructor fue eliminado.', 'success');
      }
    });
  }

  const formInstructor = document.getElementById('formInstructor');
  if (formInstructor) {
    formInstructor.addEventListener('submit', (event) => {
      event.preventDefault();
      const id = document.getElementById('instructorId').value;
      const data = {
        id: id || crypto.randomUUID().slice(0, 8),
        nombre: document.getElementById('instructorNombre').value,
        correo: document.getElementById('instructorCorreo').value,
        perfil: document.getElementById('instructorPerfil').value,
        area: document.getElementById('instructorArea').value,
        estado: document.getElementById('instructorEstado').value
      };

      if (id) {
        const index = DB.instructores.findIndex((instructor) => instructor.id === id);
        DB.instructores[index] = data;
      } else {
        DB.instructores.push(data);
      }

      guardar();
      refrescarInstructores();
      renderStats();
      bootstrap.Modal.getInstance(document.getElementById('modalInstructor')).hide();
      formInstructor.reset();
      Swal.fire('Guardado', 'El instructor fue guardado correctamente.', 'success');
    });
  }

  function refrescarInstructores() {
    if (tablaInstructores) {
      tablaInstructores.clear().rows.add(DB.instructores).draw();
    }
  }

  function aprobarInscripcion(id) {
    const item = DB.inscripciones.find((inscripcion) => inscripcion.id === id);
    if (!item) return;
    item.estado = 'Aprobada';
    guardar();
    refrescarInscripciones();
    renderStats();
    Swal.fire('Actualizada', 'La inscripción fue aprobada.', 'success');
  }

  function eliminarInscripcion(id) {
    Swal.fire({
      title: '¿Eliminar inscripción?',
      text: 'Se eliminará el registro de la inscripción.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        DB.inscripciones = DB.inscripciones.filter((inscripcion) => inscripcion.id !== id);
        guardar();
        refrescarInscripciones();
        renderStats();
        Swal.fire('Eliminada', 'La inscripción fue eliminada.', 'success');
      }
    });
  }

  function refrescarInscripciones() {
    if (tablaInscripciones) {
      tablaInscripciones.clear().rows.add(DB.inscripciones).draw();
    }
  }

  function initFormularios() {
    const exportBtn = document.getElementById('btnExport');
    if (!exportBtn) return;

    exportBtn.addEventListener('click', () => {
      const csv = [
        ['Curso', 'Tema', 'Modalidad', 'Perfil', 'Duración'],
        ...DB.cursos.map((curso) => [curso.nombre, curso.tema, curso.modalidad, curso.perfil.join('|'), curso.dur + ' h'])
      ].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');

      const link = document.createElement('a');
      link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      link.download = 'eni_capacitaciones.csv';
      link.click();
    });
  }

  function cerrarSesion() {
    localStorage.removeItem('eni_rol');
    location.reload();
  }

  if (verificarAcceso()) {
    init();
  }
})();
