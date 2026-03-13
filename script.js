const STORAGE_KEY = "sistemaAcademicoData";

const defaultState = {
  carreras: [],
  anios: [],
  clases: [],
  alumnos: [],
  carreraPorAnio: {},
  clasesPorAnio: {},
  anioPorAlumno: {},
};

const state = loadState();
let busquedaAlumno = "";

const tabs = document.querySelectorAll(".tab-btn");
const sections = document.querySelectorAll(".tab");
const searchInput = document.getElementById("buscar-alumno");

tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabs.forEach((b) => b.classList.remove("active"));
    sections.forEach((s) => s.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

if (searchInput) {
  searchInput.addEventListener("input", (event) => {
    busquedaAlumno = event.target.value.trim().toLowerCase();
    renderTabla();
  });
}

document.getElementById("form-carrera").addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = valueOf("carrera-nombre");
  addItem("carreras", { id: uid(), nombre });
  e.target.reset();
});

document.getElementById("form-anio").addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = valueOf("anio-nombre");
  addItem("anios", { id: uid(), nombre });
  e.target.reset();
});

document.getElementById("form-clase").addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = valueOf("clase-nombre");
  addItem("clases", { id: uid(), nombre });
  e.target.reset();
});

document.getElementById("form-alumno").addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = valueOf("alumno-nombre");
  const apellido = valueOf("alumno-apellido");
  const codigo = valueOf("alumno-id");

  addItem("alumnos", { id: uid(), nombre, apellido, codigo });
  e.target.reset();
});

document.getElementById("form-carrera-anio").addEventListener("submit", (e) => {
  e.preventDefault();
  const carreraId = valueOf("select-carrera");
  const anioId = valueOf("select-anio-carrera");

  if (!carreraId || !anioId) return;

  state.carreraPorAnio[anioId] = carreraId;
  persist();
  renderAll();
});

document.getElementById("form-anio-clase").addEventListener("submit", (e) => {
  e.preventDefault();
  const anioId = valueOf("select-anio-clase");
  const claseId = valueOf("select-clase");

  if (!anioId || !claseId) return;

  if (!state.clasesPorAnio[anioId]) {
    state.clasesPorAnio[anioId] = [];
  }

  if (!state.clasesPorAnio[anioId].includes(claseId)) {
    state.clasesPorAnio[anioId].push(claseId);
  }

  persist();
  renderAll();
});

document.getElementById("form-alumno-anio").addEventListener("submit", (e) => {
  e.preventDefault();
  const alumnoId = valueOf("select-alumno");
  const anioId = valueOf("select-anio-alumno");

  if (!alumnoId || !anioId) return;

  state.anioPorAlumno[alumnoId] = anioId;
  persist();
  renderAll();
});

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);

    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      carreraPorAnio: parsed.carreraPorAnio || {},
      clasesPorAnio: parsed.clasesPorAnio || {},
      anioPorAlumno: parsed.anioPorAlumno || {},
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function valueOf(id) {
  return document.getElementById(id).value.trim();
}

function addItem(key, item) {
  state[key].push(item);
  persist();
  renderAll();
}

function byId(list, id) {
  return list.find((item) => item.id === id);
}

function fillSelect(id, items, placeholder, labelFn = (i) => i.nombre) {
  const select = document.getElementById(id);
  const previousValue = select.value;

  select.innerHTML = `<option value="">${placeholder}</option>`;

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = labelFn(item);
    select.appendChild(option);
  });

  if (items.some((item) => item.id === previousValue)) {
    select.value = previousValue;
  }
}

function renderTextList(id, lines, emptyText = "Sin registros") {
  const ul = document.getElementById(id);
  ul.innerHTML = "";

  if (!lines.length) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = emptyText;
    ul.appendChild(li);
    return;
  }

  lines.forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    ul.appendChild(li);
  });
}

function renderSimpleList(id, items, labelFn) {
  renderTextList(
    id,
    items.map(labelFn),
    "Sin registros"
  );
}

function renderCarreras() {
  renderSimpleList("lista-carreras", state.carreras, (item) => item.nombre);
}

function renderAnios() {
  renderSimpleList("lista-anios", state.anios, (item) => item.nombre);
}

function renderClases() {
  renderSimpleList("lista-clases", state.clases, (item) => item.nombre);
}

function renderAlumnos() {
  renderSimpleList(
    "lista-alumnos",
    state.alumnos,
    (item) => `${item.nombre} ${item.apellido} — ${item.codigo}`
  );
}

function renderCarreraAnio() {
  const lines = state.anios
    .filter((anio) => state.carreraPorAnio[anio.id])
    .map((anio) => {
      const carrera = byId(state.carreras, state.carreraPorAnio[anio.id]);
      return `${anio.nombre}: ${carrera ? carrera.nombre : "Sin carrera"}`;
    });

  renderTextList("lista-carrera-anio", lines, "Sin asociaciones");
}

function renderAnioClase() {
  const lines = state.anios
    .filter((anio) => (state.clasesPorAnio[anio.id] || []).length)
    .map((anio) => {
      const nombresClases = (state.clasesPorAnio[anio.id] || [])
        .map((claseId) => byId(state.clases, claseId)?.nombre)
        .filter(Boolean)
        .join(", ");

      return `${anio.nombre}: ${nombresClases}`;
    });

  renderTextList("lista-anio-clase", lines, "Sin asociaciones");
}

function renderAlumnoAnio() {
  const lines = state.alumnos
    .filter((alumno) => state.anioPorAlumno[alumno.id])
    .map((alumno) => {
      const anio = byId(state.anios, state.anioPorAlumno[alumno.id]);
      return `${alumno.nombre} ${alumno.apellido}: ${anio ? anio.nombre : "Sin año"}`;
    });

  renderTextList("lista-alumno-anio", lines, "Sin asociaciones");
}

function renderTabla() {
  const tbody = document.getElementById("tabla-alumnos");
  tbody.innerHTML = "";

  if (!state.alumnos.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = '<td colspan="4" class="empty">No hay estudiantes registrados.</td>';
    tbody.appendChild(tr);
    return;
  }

  const filas = state.alumnos
    .map((alumno) => {
      const anioId = state.anioPorAlumno[alumno.id];
      const anio = byId(state.anios, anioId);
      const carreraId = anio ? state.carreraPorAnio[anio.id] : null;
      const carrera = byId(state.carreras, carreraId);

      return {
        alumno,
        carrera: carrera ? carrera.nombre : "No asignada",
        anio: anio ? anio.nombre : "No asignado",
      };
    })
    .filter((fila) => {
      if (!busquedaAlumno) return true;

      const texto = `${fila.alumno.nombre} ${fila.alumno.apellido} ${fila.alumno.codigo} ${fila.carrera} ${fila.anio}`.toLowerCase();
      return texto.includes(busquedaAlumno);
    });

  if (!filas.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = '<td colspan="4" class="empty">No se encontraron estudiantes para esa búsqueda.</td>';
    tbody.appendChild(tr);
    return;
  }

  filas.forEach((fila) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${fila.alumno.nombre} ${fila.alumno.apellido}</td>
      <td>${fila.alumno.codigo}</td>
      <td>${fila.carrera}</td>
      <td>${fila.anio}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderSelects() {
  fillSelect("select-carrera", state.carreras, "Selecciona una carrera");
  fillSelect("select-anio-carrera", state.anios, "Selecciona un año");
  fillSelect("select-anio-clase", state.anios, "Selecciona un año");
  fillSelect("select-clase", state.clases, "Selecciona una clase");
  fillSelect(
    "select-alumno",
    state.alumnos,
    "Selecciona un estudiante",
    (a) => `${a.nombre} ${a.apellido} — ${a.codigo}`
  );
  fillSelect("select-anio-alumno", state.anios, "Selecciona un año");
}

function renderAll() {
  renderCarreras();
  renderAnios();
  renderClases();
  renderAlumnos();
  renderCarreraAnio();
  renderAnioClase();
  renderAlumnoAnio();
  renderTabla();
  renderSelects();
}

renderAll();
