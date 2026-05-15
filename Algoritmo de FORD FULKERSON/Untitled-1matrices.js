
import React, { useState } from 'react';

function crearMatrizAdyacencia(n, edges) {
  const m = Array.from({ length: n }, () => Array(n).fill(0));
  edges.forEach(([src, dst]) => {
    m[src][dst] = 1;
    m[dst][src] = 1; // grafo no dirigido, quitar para dirigido
  });
  return m;
}

function crearListaAdyacencia(n, edges) {
  const lista = Array.from({ length: n }, () => []);
  edges.forEach(([src, dst]) => {
    lista[src].push(dst);
    lista[dst].push(src); // grafo no dirigido, quitar para dirigido
  });
  return lista;
}

function crearMatrizIncidencia(n, edges) {
  const m = Array.from({ length: n }, () => Array(edges.length).fill(0));
  edges.forEach(([src, dst], idx) => {
    m[src][idx] = 1;
    m[dst][idx] = 1; // grafo no dirigido, poner -1/1 para dirigido
  });
  return m;
}

function App() {
  const [nodos, setNodos] = useState(4);
  const [aristas, setAristas] = useState([{ from: 0, to: 1 }]);
  
  // Parse edges (aristas) to [from, to]
  const edgesArray = aristas.map(a => [parseInt(a.from), parseInt(a.to)]);
  
  const matrizAdyacencia = crearMatrizAdyacencia(nodos, edgesArray);
  const listaAdyacencia = crearListaAdyacencia(nodos, edgesArray);
  const matrizIncidencia = crearMatrizIncidencia(nodos, edgesArray);
  const listaAristas = edgesArray;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const handleNodoChange = (e) => {
    const v = parseInt(e.target.value);
    if (isNaN(v) || v < 1) return;

    // Si el nuevo número de nodos es menor que los nodos usados en las aristas,
    // ajustamos las aristas para que queden dentro del rango válido.
    setAristas(prev => prev.map(a => ({
      from: clamp(parseInt(a.from), 0, v - 1),
      to: clamp(parseInt(a.to), 0, v - 1),
    })));

    setNodos(v);
  };

  const handleAristaChange = (idx, campo, valor) => {
    const parsed = parseInt(valor);
    const clamped = isNaN(parsed) ? 0 : clamp(parsed, 0, nodos - 1);

    setAristas(aristas => {
      const copia = aristas.slice();
      copia[idx] = { ...copia[idx], [campo]: clamped };
      return copia;
    });

    // Si el usuario escribe un nodo más alto que el actual, expandimos el rango.
    if (!isNaN(parsed) && parsed >= nodos) {
      setNodos(parsed + 1);
    }
  };

  const agregarArista = () => {
    setAristas([...aristas, { from: 0, to: 0 }]);
  };

  const eliminarArista = (idx) => {
    setAristas(aristas.filter((_, i) => i !== idx));
  };

  return (
    <div style={{fontFamily: 'sans-serif', padding: '20px'}}>
      <h2>Representaciones de Grafos</h2>
      <div>
        <label>
          Número de nodos: 
          <input
            type="number"
            value={nodos}
            min={1}
            style={{ width: 50, marginLeft: 8 }}
            onChange={handleNodoChange}
          />
        </label>
      </div>
      <div>
        <h3>Aristas (pares de nodos)</h3>
        {aristas.map((a, idx) => (
          <div key={idx} style={{ marginBottom: 4 }}>
            <input
              type="number"
              min={0}
              max={nodos-1}
              value={a.from}
              onChange={e => handleAristaChange(idx, "from", e.target.value)}
              style={{ width: 40 }}
            />
            {' — '}
            <input
              type="number"
              min={0}
              max={nodos-1}
              value={a.to}
              onChange={e => handleAristaChange(idx, "to", e.target.value)}
              style={{ width: 40 }}
            />
            <button onClick={() => eliminarArista(idx)} style={{ marginLeft: 8 }}>Eliminar</button>
          </div>
        ))}
        <button onClick={agregarArista} style={{ marginTop: 8 }}>Agregar arista</button>
      </div>

      <h3>Matriz de adyacencia</h3>
      <table border={1} cellPadding={4}>
        <tbody>
          <tr>
            <td></td>
            {[...Array(nodos)].map((_, j) => <td key={j}><b>{j}</b></td>)}
          </tr>
          {matrizAdyacencia.map((fila, i) =>
            <tr key={i}>
              <td><b>{i}</b></td>
              {fila.map((v,j) => <td key={j}>{v}</td>)}
            </tr>
          )}
        </tbody>
      </table>

      <h3>Lista de adyacencia</h3>
      <ul>
        {listaAdyacencia.map((n, i) =>
          <li key={i}><b>{i}:</b> [{n.join(', ')}]</li>
        )}
      </ul>

      <h3>Matriz de incidencia</h3>
      <table border={1} cellPadding={4}>
        <tbody>
          <tr>
            <td></td>
            {listaAristas.map((_, idx) => <td key={idx}><b>{idx}</b></td>)}
          </tr>
          {matrizIncidencia.map((fila, i) =>
            <tr key={i}>
              <td><b>{i}</b></td>
              {fila.map((v,j) => <td key={j}>{v}</td>)}
            </tr>
          )}
        </tbody>
      </table>

      <h3>Lista de aristas</h3>
      <ul>
        {listaAristas.map(([a, b], i) => <li key={i}>{a} — {b}</li>)}
      </ul>
    </div>
  );
}

export default App;