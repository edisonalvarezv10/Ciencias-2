// Funciones para crear representaciones
function crearMatrizAdyacencia(n, edges) {
    const m = Array.from({ length: n }, () => Array(n).fill(0));
    edges.forEach(([src, dst]) => {
        if (src < n && dst < n) {
            m[src][dst] = 1;
            m[dst][src] = 1; // grafo no dirigido
        }
    });
    return m;
}

function crearListaAdyacencia(n, edges) {
    const lista = Array.from({ length: n }, () => []);
    edges.forEach(([src, dst]) => {
        if (src < n && dst < n) {
            if (src !== dst) {
                lista[src].push(dst);
                lista[dst].push(src); // grafo no dirigido
            } else {
                lista[src].push(dst); // self-loop, add only once
            }
        }
    });
    return lista;
}

function crearMatrizIncidencia(n, edges) {
    const m = Array.from({ length: n }, () => Array(edges.length).fill(0));
    edges.forEach(([src, dst], idx) => {
        if (src < n && dst < n) {
            if (src !== dst) {
                m[src][idx] = 1;
                m[dst][idx] = 1; // grafo no dirigido
            } else {
                m[src][idx] = 2; // self-loop
            }
        }
    });
    return m;
}

// Función para renderizar tabla
function renderTable(matrix, headers) {
    let html = '<table><thead><tr>';
    headers.forEach(h => html += `<th>${h}</th>`);
    html += '</tr></thead><tbody>';
    matrix.forEach((row, i) => {
        html += '<tr>';
        row.forEach(cell => html += `<td>${cell}</td>`);
        html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
}

// Función para renderizar lista
function renderList(list) {
    let html = '<ul>';
    list.forEach((item, i) => {
        html += `<li><strong>${i}:</strong> [${item.join(', ')}]</li>`;
    });
    html += '</ul>';
    return html;
}

// Función para renderizar lista de aristas
function renderEdgeList(edges) {
    let html = '<ul>';
    edges.forEach(([a, b], i) => {
        html += `<li>${a} — ${b}</li>`;
    });
    html += '</ul>';
    return html;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const nodosInput = document.getElementById('nodos');
    const edgesContainer = document.getElementById('edges-container');
    const addEdgeBtn = document.getElementById('add-edge');
    const generateBtn = document.getElementById('generate');
    
    // Agregar arista
    addEdgeBtn.addEventListener('click', function() {
        const edgeDiv = document.createElement('div');
        edgeDiv.className = 'edge-input';
        edgeDiv.innerHTML = `
            <input type="number" class="from" min="0" value="0">
            <span> — </span>
            <input type="number" class="to" min="0" value="1">
            <button class="remove-edge">Eliminar</button>
        `;
        edgesContainer.appendChild(edgeDiv);
        
        // Evento para eliminar
        edgeDiv.querySelector('.remove-edge').addEventListener('click', function() {
            edgesContainer.removeChild(edgeDiv);
        });
    });
    
    // Generar representaciones
    generateBtn.addEventListener('click', function() {
        const n = parseInt(nodosInput.value);
        if (isNaN(n) || n < 1) {
            alert('Número de nodos inválido');
            return;
        }
        
        // Obtener aristas
        const edges = [];
        const edgeInputs = edgesContainer.querySelectorAll('.edge-input');
        edgeInputs.forEach(edgeDiv => {
            const from = parseInt(edgeDiv.querySelector('.from').value);
            const to = parseInt(edgeDiv.querySelector('.to').value);
            if (!isNaN(from) && !isNaN(to)) {
                edges.push([from, to]);
            }
        });
        
        // Ajustar n si las aristas incluyen nodos mayores
        let maxNode = -1;
        edges.forEach(([a, b]) => {
            maxNode = Math.max(maxNode, a, b);
        });
        const actualN = Math.max(n, maxNode + 1);
        
        if (actualN > n) {
            alert(`Se ajustó el número de nodos a ${actualN} porque las aristas incluyen nodos mayores.`);
        }
        
        // Crear representaciones
        const matrizAdyacencia = crearMatrizAdyacencia(actualN, edges);
        const listaAdyacencia = crearListaAdyacencia(actualN, edges);
        const matrizIncidencia = crearMatrizIncidencia(actualN, edges);
        
        // Renderizar
        const headersAdj = ['', ...Array.from({length: actualN}, (_, i) => i)];
        document.getElementById('adjacency-matrix').innerHTML = renderTable(
            matrizAdyacencia.map((row, i) => [i, ...row]), 
            headersAdj
        );
        
        document.getElementById('adjacency-list').innerHTML = renderList(listaAdyacencia);
        
        const headersInc = ['', ...Array.from({length: edges.length}, (_, i) => i)];
        document.getElementById('incidence-matrix').innerHTML = renderTable(
            matrizIncidencia.map((row, i) => [i, ...row]), 
            headersInc
        );
        
        document.getElementById('edge-list').innerHTML = renderEdgeList(edges);
    });
    
    // Inicializar con una arista
    addEdgeBtn.click();
});