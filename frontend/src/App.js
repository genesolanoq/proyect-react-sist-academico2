import "./App.css";
import { useState, useEffect } from "react";

function App() {

  const [tab, setTab] = useState("configuracion");

  const [carreras, setCarreras] = useState([]);
  const [anios, setAnios] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [asociaciones, setAsociaciones] = useState([]);

  const [carreraInput, setCarreraInput] = useState("");
  const [anioInput, setAnioInput] = useState("");

  const [nombreAlumno, setNombreAlumno] = useState("");
  const [apellidoAlumno, setApellidoAlumno] = useState("");
  const [idAlumno, setIdAlumno] = useState("");

  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState("");
  const [anioSeleccionado, setAnioSeleccionado] = useState("");
  const [carreraSeleccionada, setCarreraSeleccionada] = useState("");

  useEffect(() => {
    setCarreras(JSON.parse(localStorage.getItem("carreras")) || []);
    setAnios(JSON.parse(localStorage.getItem("anios")) || []);
    setAlumnos(JSON.parse(localStorage.getItem("alumnos")) || []);
    setAsociaciones(JSON.parse(localStorage.getItem("asociaciones")) || []);
  }, []);

  useEffect(() => {
    localStorage.setItem("carreras", JSON.stringify(carreras));
  }, [carreras]);

  useEffect(() => {
    localStorage.setItem("anios", JSON.stringify(anios));
  }, [anios]);

  useEffect(() => {
    localStorage.setItem("alumnos", JSON.stringify(alumnos));
  }, [alumnos]);

  useEffect(() => {
    localStorage.setItem("asociaciones", JSON.stringify(asociaciones));
  }, [asociaciones]);


  function agregarCarrera(e){
    e.preventDefault();
    if(!carreraInput) return;

    setCarreras([...carreras, carreraInput]);
    setCarreraInput("");
  }

  function eliminarCarrera(i){
    const nueva = [...carreras];
    nueva.splice(i,1);
    setCarreras(nueva);
  }

  function agregarAnio(e){
    e.preventDefault();
    if(!anioInput) return;

    setAnios([...anios, anioInput]);
    setAnioInput("");
  }

  function eliminarAnio(i){
    const nueva = [...anios];
    nueva.splice(i,1);
    setAnios(nueva);
  }

  function agregarAlumno(e){
    e.preventDefault();

    const nuevo = {
      nombre:nombreAlumno,
      apellido:apellidoAlumno,
      id:idAlumno
    };

    setAlumnos([...alumnos,nuevo]);

    setNombreAlumno("");
    setApellidoAlumno("");
    setIdAlumno("");
  }

  function eliminarAlumno(i){
    const nueva=[...alumnos];
    nueva.splice(i,1);
    setAlumnos(nueva);
  }

  function asociarAlumno(e){
    e.preventDefault();

    const nueva={
      alumno:alumnoSeleccionado,
      carrera:carreraSeleccionada,
      anio:anioSeleccionado
    };

    setAsociaciones([...asociaciones,nueva]);
  }

  return (

    <div>

      <header>

        <h1>Sistema Académico</h1>

        <nav>

          <button onClick={()=>setTab("configuracion")}>
            Configuración
          </button>

          <button onClick={()=>setTab("principal")}>
            Principal
          </button>

        </nav>

      </header>


      <main>

        {tab==="configuracion" && (

        <div>

        <h2>Configuración</h2>

        <div className="grid">


        <article className="card">

        <h3>Carreras</h3>

        <form onSubmit={agregarCarrera}>
        <input
        placeholder="Carrera"
        value={carreraInput}
        onChange={(e)=>setCarreraInput(e.target.value)}
        />
        <button>Agregar</button>
        </form>

        <ul>
        {carreras.map((c,i)=>(
        <li key={i}>
        {c}
        <button onClick={()=>eliminarCarrera(i)}>❌</button>
        </li>
        ))}
        </ul>

        </article>


        <article className="card">

        <h3>Años</h3>

        <form onSubmit={agregarAnio}>
        <input
        placeholder="Ej:1ro"
        value={anioInput}
        onChange={(e)=>setAnioInput(e.target.value)}
        />
        <button>Agregar</button>
        </form>

        <ul>
        {anios.map((a,i)=>(
        <li key={i}>
        {a}
        <button onClick={()=>eliminarAnio(i)}>❌</button>
        </li>
        ))}
        </ul>

        </article>


        <article className="card">

        <h3>Alumnos</h3>

        <form onSubmit={agregarAlumno}>

        <input
        placeholder="Nombre"
        value={nombreAlumno}
        onChange={(e)=>setNombreAlumno(e.target.value)}
        />

        <input
        placeholder="Apellido"
        value={apellidoAlumno}
        onChange={(e)=>setApellidoAlumno(e.target.value)}
        />

        <input
        placeholder="ID"
        value={idAlumno}
        onChange={(e)=>setIdAlumno(e.target.value)}
        />

        <button>Agregar</button>

        </form>

        <ul>
        {alumnos.map((a,i)=>(
        <li key={i}>
        {a.nombre} {a.apellido}
        <button onClick={()=>eliminarAlumno(i)}>❌</button>
        </li>
        ))}
        </ul>

        </article>

        </div>

        </div>

        )}



        {tab==="principal" && (

        <div>

        <h2>Principal</h2>

        <form onSubmit={asociarAlumno}>

        <select onChange={(e)=>setAlumnoSeleccionado(e.target.value)}>
        <option>Alumno</option>
        {alumnos.map((a,i)=>(
        <option key={i}>{a.nombre}</option>
        ))}
        </select>

        <select onChange={(e)=>setCarreraSeleccionada(e.target.value)}>
        <option>Carrera</option>
        {carreras.map((c,i)=>(
        <option key={i}>{c}</option>
        ))}
        </select>

        <select onChange={(e)=>setAnioSeleccionado(e.target.value)}>
        <option>Año</option>
        {anios.map((a,i)=>(
        <option key={i}>{a}</option>
        ))}
        </select>

        <button>Asociar</button>

        </form>


        <h3>Tabla final</h3>

        <table>

        <thead>
        <tr>
        <th>Alumno</th>
        <th>Carrera</th>
        <th>Año</th>
        </tr>
        </thead>

        <tbody>

        {asociaciones.map((a,i)=>(
        <tr key={i}>
        <td>{a.alumno}</td>
        <td>{a.carrera}</td>
        <td>{a.anio}</td>
        </tr>
        ))}

        </tbody>

        </table>

        </div>

        )}

      </main>

    </div>
  );
}

export default App;