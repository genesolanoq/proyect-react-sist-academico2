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

const tabs = document.querySelectorAll(".tab-btn");
const sections = document.querySelectorAll(".tab");

tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabs.forEach((b) => b.classList.remove("active"));
    sections.forEach((s) => s.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

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
  state.carreraPorAnio[anioId] = carreraId;
  persistAndRender();
});

document.getElementById("form-anio-clase").addEventListener("submit", (e) => {
  e.preventDefault();
  const anioId = valueOf("select-anio-clase");
  const claseId = valueOf("select-clase");

  if (!state.clasesPorAnio[anioId]) {
    state.clasesPorAnio[anioId] = [];
  }

  if (!state.clasesPorAnio[anioId].includes(claseId)) {
    state.clasesPorAnio[anioId].push(claseId);
    persistAndRender();
  }
});

document.getElementById("form-alumno-anio").addEventListener("submit", (e) => {
  e.preventDefault();
  const alumnoId = valueOf("select-alumno");
  const anioId = valueOf("select-anio-alumno");
  state.anioPorAlumno[alumnoId] = anioId;
  persistAndRender();
});

function addItem(collection, item) {
  state[collection].push(item);
  persistAndRender();
}

function persistAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  render();
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return structuredClone(defaultState);
  }

  try {
    return { ...structuredClone(defaultState), ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultState);
  }
}

function render() {
  renderSimpleList("lista-carreras", state.carreras, (i) => i.nombre);
  renderSimpleList("lista-anios", state.anios, (i) => i.nombre);
  renderSimpleList("lista-clases", state.clases, (i) => i.nombre);
  renderSimpleList(
    "lista-alumnos",
    state.alumnos,
    (i) => `${i.nombre} ${i.apellido} (${i.codigo})`
  );

  fillSelect("select-carrera", state.carreras, "Seleccione carrera");
  fillSelect("select-anio-carrera", state.anios, "Seleccione año");
  fillSelect("select-anio-clase", state.anios, "Seleccione año");
  fillSelect("select-clase", state.clases, "Seleccione clase");
  fillSelect("select-alumno", state.alumnos, "Seleccione alumno", (a) => `${a.nombre} ${a.apellido}`);
  fillSelect("select-anio-alumno", state.anios, "Seleccione año");

  renderCarreraAnio();
  renderAnioClase();
  renderAlumnoAnio();
  renderTabla();
}

function renderCarreraAnio() {
  const lines = state.anios
    .filter((a) => state.carreraPorAnio[a.id])
    .map((anio) => {
      const carrera = byId(state.carreras, state.carreraPorAnio[anio.id]);
      return `${anio.nombre}: ${carrera ? carrera.nombre : "Sin carrera"}`;
    });

  renderTextList("lista-carrera-anio", lines, "Sin asociaciones");
}

function renderAnioClase() {
  const lines = state.anios
    .filter((a) => state.clasesPorAnio[a.id]?.length)
    .map((anio) => {
      const nombresClases = state.clasesPorAnio[anio.id]
        .map((id) => byId(state.clases, id)?.nombre)
        .filter(Boolean)
        .join(", ");
      return `${anio.nombre}: ${nombresClases}`;
    });

  renderTextList("lista-anio-clase", lines, "Sin asociaciones");
}

function renderAlumnoAnio() {
  const lines = state.alumnos
    .filter((a) => state.anioPorAlumno[a.id])
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
    tr.innerHTML = '<td colspan="3" class="empty">No hay alumnos registrados.</td>';
    tbody.appendChild(tr);
    return;
  }

  state.alumnos.forEach((alumno) => {
    const anioId = state.anioPorAlumno[alumno.id];
    const anio = byId(state.anios, anioId);
    const carreraId = anio ? state.carreraPorAnio[anio.id] : null;
    const carrera = byId(state.carreras, carreraId);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${alumno.nombre} ${alumno.apellido}</td>
      <td>${carrera ? carrera.nombre : "No asignada"}</td>
      <td>${anio ? anio.nombre : "No asignado"}</td>
    `;
    tbody.appendChild(tr);
  });
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

function renderSimpleList(id, items, labelFn) {
  const lines = items.map(labelFn);
  renderTextList(id, lines, "Sin registros");
}

function renderTextList(id, lines, emptyText) {
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

function byId(collection, id) {
  return collection.find((item) => item.id === id) || null;
}

function valueOf(id) {
  return document.getElementById(id).value.trim();
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

render();
