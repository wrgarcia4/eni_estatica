(function () {
  const cursoBase = [
    { id: 1, nombre: 'Fundamentos de IA para la formación', tema: 'Tecnologías de la Información', modalidad: 'Virtual', dur: 40, nivel: 'Básico', descripcion: 'Introducción práctica a la IA aplicada a procesos formativos.', perfil: ['Planta', 'Provisional'] },
    { id: 2, nombre: 'Didáctica para ambientes virtuales', tema: 'Pedagogía y Didáctica', modalidad: 'Mixta', dur: 60, nivel: 'Intermedio', descripcion: 'Diseño de estrategias y materiales para entornos digitales.', perfil: ['Planta', 'Provisional'] },
    { id: 3, nombre: 'Seguridad y salud en el trabajo', tema: 'Salud y Seguridad', modalidad: 'Presencial', dur: 30, nivel: 'Básico', descripcion: 'Buenas prácticas, prevención y cumplimiento normativo.', perfil: ['Planta'] },
    { id: 4, nombre: 'Gestión de proyectos con PMI', tema: 'Gestión Empresarial', modalidad: 'Virtual', dur: 50, nivel: 'Avanzado', descripcion: 'Planeación, seguimiento y control de proyectos.', perfil: ['Planta', 'Provisional'] },
    { id: 5, nombre: 'Inglés técnico para instructores', tema: 'Idiomas', modalidad: 'Virtual', dur: 80, nivel: 'Intermedio', descripcion: 'Desarrollo de habilidades comunicativas en contextos técnicos.', perfil: ['Provisional'] }
  ];

  const defaultProfile = {
    doc: '1234567890',
    nombre: 'María López',
    correo: 'maria.lopez@sena.edu.co',
    telefono: '3001234567',
    area: 'Tecnologías de la Información',
    tipo: 'Planta'
  };

  function getRol() {
    return localStorage.getItem('eni_rol') || 'Operativo';
  }

  function getProfile() {
    const stored = localStorage.getItem('eni_perfil');
    return stored ? JSON.parse(stored) : defaultProfile;
  }

  function setProfile(profile) {
    localStorage.setItem('eni_perfil', JSON.stringify(profile));
  }

  function getInscripciones() {
    const saved = localStorage.getItem('eni_inscripciones_operativo');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, cursoId: 1, nombre: 'Fundamentos de IA para la formación', tema: 'Tecnologías de la Información', modalidad: 'Virtual', horas: 40, fecha: '2026-09-15', estado: 'Aprobada' },
      { id: 2, cursoId: 2, nombre: 'Didáctica para ambientes virtuales', tema: 'Pedagogía y Didáctica', modalidad: 'Mixta', horas: 60, fecha: '2026-09-28', estado: 'Pendiente' },
      { id: 3, cursoId: 3, nombre: 'Seguridad y salud en el trabajo', tema: 'Salud y Seguridad', modalidad: 'Presencial', horas: 30, fecha: '2026-10-04', estado: 'Aprobada' }
    ];
  }

  function saveInscripciones(data) {
    localStorage.setItem('eni_inscripciones_operativo', JSON.stringify(data));
  }

  function irA(view) {
    document.querySelectorAll('.nav-link[data-view]').forEach((link) => {
      const isActive = link.dataset.view === view;
      link.classList.toggle('active', isActive);
    });

    document.querySelectorAll('.view').forEach((section) => {
      section.classList.add('d-none');
    });

    const target = document.getElementById('view-' + view);
    if (target) target.classList.remove('d-none');
    const title = document.getElementById('viewTitle');
    if (title) {
      const titles = {
        inicio: 'Inicio',
        catalogo: 'Catálogo',
        'mis-inscripciones': 'Mis inscripciones',
        ruta: 'Mi ruta formativa',
        certificados: 'Certificados',
        perfil: 'Mi perfil'
      };
      title.textContent = titles[view] || 'Inicio';
    }
  }

  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('open');
  }

  function logout() {
    localStorage.removeItem('eni_rol');
    window.location.href = 'index.html';
  }

  function renderHome() {
    const inscripciones = getInscripciones();
    const aprobadas = inscripciones.filter((i) => i.estado === 'Aprobada').length;
    const pendientes = inscripciones.filter((i) => i.estado === 'Pendiente').length;
    const horas = inscripciones.reduce((sum, i) => sum + (i.horas || 0), 0);

    const kpiInscritas = document.getElementById('kpiInscritas');
    const kpiPendientes = document.getElementById('kpiPendientes');
    const kpiCertificados = document.getElementById('kpiCertificados');
    const kpiHoras = document.getElementById('kpiHoras');

    if (kpiInscritas) kpiInscritas.textContent = inscripciones.length;
    if (kpiPendientes) kpiPendientes.textContent = pendientes;
    if (kpiCertificados) kpiCertificados.textContent = aprobadas;
    if (kpiHoras) kpiHoras.textContent = horas;

    const perfil = getProfile();
    const nombre = perfil.nombre.split(' ')[0];
    const nombreInstructor = document.getElementById('nombreInstructor');
    if (nombreInstructor) nombreInstructor.textContent = nombre;

    const recomendadas = document.getElementById('recomendadas');
    if (recomendadas) {
      const cursos = cursoBase.filter((curso) => !inscripciones.some((i) => i.cursoId === curso.id));
      recomendadas.innerHTML = cursos.slice(0, 3).map((curso) => `
        <div class="col-md-6">
          <div class="card-curso-op">
            <div>
              <span class="chip">${curso.tema}</span>
              <span class="chip-gris">${curso.modalidad}</span>
            </div>
            <p class="titulo">${curso.nombre}</p>
            <div class="meta">${curso.dur} horas · ${curso.nivel}</div>
            <button class="btn btn-sena btn-sm mt-auto" onclick="abrirDetalle(${curso.id})">Ver detalle</button>
          </div>
        </div>
      `).join('');
    }

    const timeline = document.getElementById('timeline');
    if (timeline) {
      const items = inscripciones.slice(0, 4).map((i) => `
        <li>
          <strong>${i.nombre}</strong>
          <small>${i.fecha} · ${i.estado}</small>
        </li>
      `);
      timeline.innerHTML = items.join('');
    }
  }

  function renderCatalogo() {
    const input = document.getElementById('buscarCurso');
    const tema = document.getElementById('filtroTemaOp');
    const mod = document.getElementById('filtroModOp');
    const nivel = document.getElementById('filtroNivelOp');
    const grid = document.getElementById('gridCatalogo');
    const sinCursos = document.getElementById('sinCursos');

    if (!grid) return;

    const query = (input && input.value || '').trim().toLowerCase();
    const temaValue = tema ? tema.value : '';
    const modValue = mod ? mod.value : '';
    const nivelValue = nivel ? nivel.value : '';

    const filtered = cursoBase.filter((curso) => {
      const matchesText = !query || curso.nombre.toLowerCase().includes(query) || curso.tema.toLowerCase().includes(query);
      const matchesTema = !temaValue || curso.tema === temaValue;
      const matchesMod = !modValue || curso.modalidad === modValue;
      const matchesNivel = !nivelValue || curso.nivel === nivelValue;
      return matchesText && matchesTema && matchesMod && matchesNivel;
    });

    grid.innerHTML = filtered.map((curso) => `
      <div class="col-md-6 col-xl-4">
        <div class="card-curso-op">
          <div>
            <span class="chip">${curso.tema}</span>
            <span class="chip-gris">${curso.modalidad}</span>
          </div>
          <p class="titulo">${curso.nombre}</p>
          <div class="meta">${curso.dur} horas · ${curso.nivel}</div>
          <div class="mt-auto d-flex gap-2">
            <button class="btn btn-sena btn-sm" onclick="abrirDetalle(${curso.id})">Detalle</button>
            <button class="btn btn-outline-success btn-sm" onclick="inscribirme(${curso.id})">Inscribirme</button>
          </div>
        </div>
      </div>
    `).join('');

    if (sinCursos) sinCursos.classList.toggle('d-none', filtered.length > 0);
  }

  function renderInscripciones() {
    const tableBody = document.querySelector('#tablaMisInscripciones tbody');
    if (!tableBody) return;

    const inscripciones = getInscripciones();
    tableBody.innerHTML = inscripciones.map((i) => `
      <tr>
        <td>${i.id}</td>
        <td>${i.nombre}</td>
        <td>${i.tema || i.tema}</td>
        <td>${i.modalidad}</td>
        <td>${i.horas}h</td>
        <td>${i.fecha}</td>
        <td><span class="badge bg-${i.estado === 'Aprobada' ? 'success' : 'warning'}">${i.estado}</span></td>
        <td><button class="btn btn-sm btn-outline-danger" onclick="cancelarInscripcion(${i.id})">Cancelar</button></td>
      </tr>
    `).join('');
  }

  function renderRuta() {
    const rutaTimeline = document.getElementById('rutaTimeline');
    const progressRuta = document.getElementById('progressRuta');
    const progressTexto = document.getElementById('progressTexto');
    if (!rutaTimeline || !progressRuta || !progressTexto) return;

    const lista = [
      { nombre: 'Registro y diagnóstico', completado: true },
      { nombre: 'Módulo de formación inicial', completado: true },
      { nombre: 'Actividades prácticas', completado: true },
      { nombre: 'Proyecto integrador', completado: false, actual: true },
      { nombre: 'Certificación final', completado: false }
    ];

    const avance = 60;
    progressRuta.style.width = avance + '%';
    progressTexto.textContent = avance + '%';

    rutaTimeline.innerHTML = lista.map((step, index) => {
      const cls = step.completado ? 'completada' : step.actual ? 'actual' : '';
      const numero = index + 1;
      return `
        <div class="ruta-item ${cls}">
          <span class="numero">${numero}</span>
          <strong>${step.nombre}</strong>
          <div class="small text-muted">${step.completado ? 'Completado' : step.actual ? 'En progreso' : 'Pendiente'}</div>
        </div>
      `;
    }).join('');
  }

  function renderCertificados() {
    const grid = document.getElementById('gridCertificados');
    const sin = document.getElementById('sinCertificados');
    if (!grid) return;

    const inscripciones = getInscripciones().filter((i) => i.estado === 'Aprobada');
    if (!inscripciones.length) {
      if (sin) sin.classList.remove('d-none');
      grid.innerHTML = '';
      return;
    }

    if (sin) sin.classList.add('d-none');
    grid.innerHTML = inscripciones.map((i) => `
      <div class="col-md-6 col-lg-4">
        <div class="cert-card">
          <i class="bi bi-award-fill"></i>
          <h6>${i.nombre}</h6>
          <small class="text-muted">${i.fecha}</small>
        </div>
      </div>
    `).join('');
  }

  function renderPerfil() {
    const perfil = getProfile();
    const nombreInput = document.getElementById('perfilNombreInput');
    const correoInput = document.getElementById('perfilCorreoInput');
    const telInput = document.getElementById('perfilTel');
    const areaSelect = document.getElementById('perfilArea');
    const tipoSelect = document.getElementById('perfilTipoInput');
    const doc = document.getElementById('perfilDoc');
    const nombre = document.getElementById('perfilNombre');
    const correo = document.getElementById('perfilCorreo');
    const tipo = document.getElementById('perfilTipo');
    const userName = document.getElementById('userName');

    if (nombre) nombre.textContent = perfil.nombre;
    if (correo) correo.textContent = perfil.correo;
    if (tipo) tipo.textContent = perfil.tipo;
    if (userName) userName.textContent = perfil.nombre.split(' ')[0];
    if (doc) doc.value = perfil.doc;
    if (nombreInput) nombreInput.value = perfil.nombre;
    if (correoInput) correoInput.value = perfil.correo;
    if (telInput) telInput.value = perfil.telefono;
    if (areaSelect) areaSelect.value = perfil.area;
    if (tipoSelect) tipoSelect.value = perfil.tipo;
  }

  function abrirDetalle(id) {
    const curso = cursoBase.find((item) => item.id === id);
    if (!curso) return;

    const modal = document.getElementById('modalDetalle');
    const detalleTitulo = document.getElementById('detalleTitulo');
    const detalleBody = document.getElementById('detalleBody');
    const btnInscribir = document.getElementById('btnInscribir');

    if (!modal || !detalleTitulo || !detalleBody || !btnInscribir) return;

    detalleTitulo.textContent = curso.nombre;
    detalleBody.innerHTML = `
      <div class="mb-3">
        <span class="chip">${curso.tema}</span>
        <span class="chip-gris">${curso.modalidad}</span>
      </div>
      <p>${curso.descripcion}</p>
      <ul class="list-unstyled mb-0">
        <li><strong>Duración:</strong> ${curso.dur} horas</li>
        <li><strong>Nivel:</strong> ${curso.nivel}</li>
        <li><strong>Perfil:</strong> ${curso.perfil.join(', ')}</li>
      </ul>
    `;
    btnInscribir.setAttribute('data-curso-id', String(curso.id));

    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
  }

  function inscribirme(id) {
    const curso = cursoBase.find((item) => item.id === id);
    if (!curso) return;

    const inscripciones = getInscripciones();
    if (inscripciones.some((item) => item.cursoId === id)) {
      alert('Ya estás inscrito en esta capacitación.');
      return;
    }

    inscripciones.push({
      id: Date.now(),
      cursoId: curso.id,
      nombre: curso.nombre,
      tema: curso.tema,
      modalidad: curso.modalidad,
      horas: curso.dur,
      fecha: new Date().toISOString().slice(0, 10),
      estado: 'Pendiente'
    });

    saveInscripciones(inscripciones);
    renderHome();
    renderInscripciones();
    renderCatalogo();
    renderCertificados();
    alert('Inscripción registrada correctamente.');
  }

  function cancelarInscripcion(id) {
    if (!confirm('¿Deseas cancelar esta inscripción?')) return;
    const inscripciones = getInscripciones().filter((item) => item.id !== id);
    saveInscripciones(inscripciones);
    renderHome();
    renderInscripciones();
    renderCertificados();
  }

  function bindEvents() {
    document.querySelectorAll('.nav-link[data-view]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        irA(link.dataset.view);
      });
    });

    const formPerfil = document.getElementById('formPerfil');
    if (formPerfil) {
      formPerfil.addEventListener('submit', (event) => {
        event.preventDefault();
        const profile = {
          doc: document.getElementById('perfilDoc').value,
          nombre: document.getElementById('perfilNombreInput').value,
          correo: document.getElementById('perfilCorreoInput').value,
          telefono: document.getElementById('perfilTel').value,
          area: document.getElementById('perfilArea').value,
          tipo: document.getElementById('perfilTipoInput').value
        };
        setProfile(profile);
        renderPerfil();
        renderHome();
        alert('Perfil actualizado correctamente.');
      });
    }

    const buscar = document.getElementById('buscarCurso');
    const tema = document.getElementById('filtroTemaOp');
    const mod = document.getElementById('filtroModOp');
    const nivel = document.getElementById('filtroNivelOp');
    [buscar, tema, mod, nivel].forEach((el) => {
      if (el) el.addEventListener('input', renderCatalogo);
      if (el) el.addEventListener('change', renderCatalogo);
    });

    const btnInscribir = document.getElementById('btnInscribir');
    if (btnInscribir) {
      btnInscribir.addEventListener('click', () => {
        const id = Number(btnInscribir.getAttribute('data-curso-id'));
        if (id) inscribirme(id);
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalDetalle'));
        if (modal) modal.hide();
      });
    }
  }

  function init() {
    const rol = getRol();
    const panel = document.getElementById('panelContent');
    const acceso = document.getElementById('accesoDenegado');
    const rolActual = document.getElementById('rolActual');
    const rolBadge = document.getElementById('rolBadge');

    if (rolActual) rolActual.textContent = rol || 'Sin sesión';
    if (rolBadge) rolBadge.textContent = rol ? `Rol: ${rol}` : 'Sin sesión';

    if (rol !== 'Operativo') {
      if (acceso) acceso.classList.remove('d-none');
      if (panel) panel.classList.add('d-none');
      return;
    }

    if (panel) panel.classList.remove('d-none');
    if (acceso) acceso.classList.add('d-none');

    renderHome();
    renderCatalogo();
    renderInscripciones();
    renderRuta();
    renderCertificados();
    renderPerfil();
    bindEvents();
    irA('inicio');
  }

  window.toggleSidebar = toggleSidebar;
  window.irA = irA;
  window.logout = logout;
  window.abrirDetalle = abrirDetalle;
  window.inscribirme = inscribirme;
  window.cancelarInscripcion = cancelarInscripcion;

  init();
})();
