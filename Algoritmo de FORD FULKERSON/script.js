// Funciones para crear representaciones
function numToLetter(n) {
    return String.fromCharCode(65 + n); // 65 is 'A'
}

// Variables globales para almacenar resultados de Ford-Fulkerson
let maxFlowResult = null;
let currentEdges = [];
let currentN = 0;



// Función para buscar camino más corto
// Función para calcular flujo máximo
function calcularFlujoMaximo() {
    const sourceSel = document.getElementById('source-node');
    const sinkSel = document.getElementById('sink-node');
    const resultDiv = document.getElementById('max-flow-result');
    
    const source = parseInt(sourceSel.value);
    const sink = parseInt(sinkSel.value);
    
    if (isNaN(source) || isNaN(sink)) {
        resultDiv.innerHTML = `<strong style="color: #d32f2f;">Error: Selecciona ambos nodos (fuente y sumidero)</strong>`;
        resultDiv.style.display = 'block';
        return;
    }
    
    if (source === sink) {
        resultDiv.innerHTML = `<strong style="color: #d32f2f;">Error: El nodo fuente y sumidero deben ser diferentes</strong>`;
        resultDiv.style.display = 'block';
        return;
    }
    
    if (currentEdges.length === 0 || currentN === 0) {
        resultDiv.innerHTML = `<strong style="color: #d32f2f;">Error: Genera las representaciones primero</strong>`;
        resultDiv.style.display = 'block';
        return;
    }

    if (currentEdges.some(([, , capacity]) => capacity <= 0)) {
        resultDiv.innerHTML = `<strong style="color: #d32f2f;">Error: Ford-Fulkerson requiere capacidades positivas. Ajusta las aristas y vuelve a generar el grafo.</strong>`;
        resultDiv.style.display = 'block';
        return;
    }
    
    if (source < 0 || source >= currentN || sink < 0 || sink >= currentN) {
        resultDiv.innerHTML = `<strong style="color: #d32f2f;">Error: Los nodos deben estar en el rango 0-${currentN-1}</strong>`;
        resultDiv.style.display = 'block';
        return;
    }

    try {
        maxFlowResult = fordFulkerson(currentN, currentEdges, source, sink);
        document.getElementById('max-flow').innerHTML = `<p><strong>Flujo máximo de ${numToLetter(source)} a ${numToLetter(sink)}:</strong> ${maxFlowResult}</p>`;
        resultDiv.innerHTML = `<strong style="color: #2e7d32;">✓ Flujo máximo calculado: ${maxFlowResult}</strong>`;
        resultDiv.style.display = 'block';
    } catch (error) {
        resultDiv.innerHTML = `<strong style="color: #d32f2f;">Error: ${error.message}</strong>`;
        resultDiv.style.display = 'block';
        console.error('Error en Ford-Fulkerson:', error);
    }
}

function crearMatrizAdyacencia(n, edges) {
    const m = Array.from({ length: n }, () => Array(n).fill(0));
    edges.forEach(([src, dst, capacity]) => {
        if (src < n && dst < n) {
            m[src][dst] = capacity;
        }
    });
    return m;
}

function crearListaAdyacencia(n, edges) {
    const lista = Array.from({ length: n }, () => []);
    edges.forEach(([src, dst]) => {
        if (src < n && dst < n) {
            lista[src].push(dst);
        }
    });
    return lista;
}

function crearMatrizIncidencia(n, edges) {
    const m = Array.from({ length: n }, () => Array(edges.length).fill(0));
    edges.forEach(([src, dst], idx) => {
        if (src < n && dst < n) {
            m[src][idx] = -1;
            m[dst][idx] = 1;
        }
    });
    return m;
}

function fordFulkerson(n, edges, source, sink) {
    if (!Number.isInteger(source) || source < 0 || source >= n) {
        throw new Error('Nodo fuente inválido.');
    }
    if (!Number.isInteger(sink) || sink < 0 || sink >= n) {
        throw new Error('Nodo sumidero inválido.');
    }
    if (source === sink) {
        throw new Error('El nodo fuente y sumidero deben ser diferentes.');
    }

    // Build capacity matrix for directed edges
    const capacity = Array.from({ length: n }, () => Array(n).fill(0));
    edges.forEach(([from, to, cap]) => {
        if (!Number.isInteger(from) || !Number.isInteger(to)) {
            throw new Error('Las aristas deben tener nodos válidos.');
        }
        if (from < 0 || from >= n || to < 0 || to >= n) {
            throw new Error(`Nodo fuera de rango. Rango válido: 0-${n-1}`);
        }
        if (cap <= 0) {
            throw new Error('Las capacidades deben ser positivas.');
        }
        capacity[from][to] += cap; // Permite múltiples aristas entre los mismos nodos
    });

    // Residual graph - copia de la matriz de capacidad
    const residual = capacity.map(row => row.slice());
    let maxFlow = 0;

    function bfs() {
        // Reinicializar parent en cada llamada a BFS
        const parent = Array(n).fill(-1);
        const visited = Array(n).fill(false);
        const queue = [];
        
        queue.push(source);
        visited[source] = true;

        while (queue.length > 0) {
            const u = queue.shift();
            
            for (let v = 0; v < n; v++) {
                // Si no ha sido visitado y hay capacidad disponible en el grafo residual
                if (!visited[v] && residual[u][v] > 0) {
                    visited[v] = true;
                    parent[v] = u;
                    
                    if (v === sink) {
                        return parent; // Retornar el array parent si se encontró camino
                    }
                    
                    queue.push(v);
                }
            }
        }
        return null; // No hay camino encontrado
    }

    // Mientras exista un camino de fuente a sumidero
    let parent;
    while ((parent = bfs()) !== null) {
        // Encontrar la capacidad mínima en el camino
        let pathFlow = Infinity;
        for (let v = sink; v !== source; v = parent[v]) {
            const u = parent[v];
            pathFlow = Math.min(pathFlow, residual[u][v]);
        }

        // Actualizar capacidades residuales
        for (let v = sink; v !== source; v = parent[v]) {
            const u = parent[v];
            residual[u][v] -= pathFlow;
            residual[v][u] += pathFlow; // Agregar capacidad de retorno para posibles caminos aumentadores
        }

        maxFlow += pathFlow;
    }

    return maxFlow;
}







// Función para dibujar el grafo
function drawGraph(n, edges) {
    const graphDiv = document.getElementById('graph');
    graphDiv.innerHTML = ''; // Limpiar
    
    const width = graphDiv.clientWidth;
    const height = graphDiv.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    // Crear SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    graphDiv.appendChild(svg);

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '10');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', 'M0,0 L10,3.5 L0,7 Z');
    arrowPath.setAttribute('fill', '#333');
    marker.appendChild(arrowPath);
    defs.appendChild(marker);
    svg.appendChild(defs);
    
    // Posiciones de nodos en círculo
    const nodePositions = [];
    for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI * i) / n;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        nodePositions.push({ x, y });
    }
    
    // Dibujar aristas
    edges.forEach(([src, dst, weight]) => {
        if (src < n && dst < n) {
            const pos1 = nodePositions[src];
            const pos2 = nodePositions[dst];
            const dx = pos2.x - pos1.x;
            const dy = pos2.y - pos1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const offset = 22;
            const startX = pos1.x + (dx / dist) * offset;
            const startY = pos1.y + (dy / dist) * offset;
            const endX = pos2.x - (dx / dist) * offset;
            const endY = pos2.y - (dy / dist) * offset;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', startX);
            line.setAttribute('y1', startY);
            line.setAttribute('x2', endX);
            line.setAttribute('y2', endY);
            line.setAttribute('stroke', '#333');
            line.setAttribute('stroke-width', '2');
            line.setAttribute('marker-end', 'url(#arrowhead)');
            svg.appendChild(line);
            
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', midX);
            text.setAttribute('y', midY - 5);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '12px');
            text.textContent = weight;
            svg.appendChild(text);
        }
    });
    
    // Dibujar nodos
    nodePositions.forEach((pos, i) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pos.x);
        circle.setAttribute('cy', pos.y);
        circle.setAttribute('r', '20');
        circle.setAttribute('fill', '#4CAF50');
        circle.setAttribute('stroke', '#333');
        circle.setAttribute('stroke-width', '2');
        svg.appendChild(circle);
        
        // Etiqueta del nodo
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pos.x);
        text.setAttribute('y', pos.y + 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '14px');
        text.setAttribute('fill', 'white');
        text.textContent = numToLetter(i);
        svg.appendChild(text);
    });
}

// Función para renderizar tabla
function renderTable(matrix, headers) {
    let html = '<table><thead><tr>';
    headers.forEach(h => html += `<th>${h}</th>`);
    html += '</tr></thead><tbody>';
    matrix.forEach((row, i) => {
        html += '<tr>';
        row.forEach(cell => {
            const display = cell === Infinity ? '∞' : cell;
            html += `<td>${display}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
}

// Función para renderizar lista
function renderList(list) {
    let html = '<ul>';
    list.forEach((item, i) => {
        html += `<li><strong>${numToLetter(i)}:</strong> [${item.map(numToLetter).join(', ')}]</li>`;
    });
    html += '</ul>';
    return html;
}

// Función para renderizar lista de aristas
function renderEdgeList(edges) {
    let html = '<ul>';
    edges.forEach(([a, b, w], i) => {
        html += `<li>${numToLetter(a)} → ${numToLetter(b)} (capacidad: ${w})</li>`;
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
            <span> Capacidad: </span>
            <input type="number" class="weight" min="1" value="1">
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
            alert('Número de nodos inválido (debe ser >= 1)');
            return;
        }
        
        // Obtener aristas
        const edges = [];
        const edgeInputs = edgesContainer.querySelectorAll('.edge-input');
        edgeInputs.forEach((edgeDiv, idx) => {
            const from = parseInt(edgeDiv.querySelector('.from').value);
            const to = parseInt(edgeDiv.querySelector('.to').value);
            const weight = parseInt(edgeDiv.querySelector('.weight').value) || 1;
            
            // Validar que los valores sean números enteros
            if (isNaN(from) || isNaN(to)) {
                console.warn(`Arista ${idx}: valores inválidos`);
                return;
            }
            
            // Validar que sean no negativos
            if (from < 0 || to < 0) {
                console.warn(`Arista ${idx}: los nodos deben ser >= 0`);
                return;
            }
            
            // Validar capacidad
            if (isNaN(weight) || weight <= 0) {
                console.warn(`Arista ${idx}: capacidad debe ser > 0`);
                return;
            }
            
            edges.push([from, to, weight]);
        });
        
        if (edges.length === 0) {
            alert('Debes agregar al menos una arista');
            return;
        }
        
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
        const sourceNode = document.getElementById('source-node');
        const sinkNode = document.getElementById('sink-node');
        sourceNode.innerHTML = '<option value="">Seleccionar nodo fuente</option>';
        sinkNode.innerHTML = '<option value="">Seleccionar nodo sumidero</option>';
        
        currentEdges = edges;
        currentN = actualN;
        
        for (let i = 0; i < actualN; i++) {
            const optSource = document.createElement('option');
            optSource.value = i;
            optSource.textContent = numToLetter(i);
            sourceNode.appendChild(optSource);
            
            const optSink = document.createElement('option');
            optSink.value = i;
            optSink.textContent = numToLetter(i);
            sinkNode.appendChild(optSink);
        }
        
        // Usar nodos predeterminados
        if (actualN > 1) {
            sourceNode.selectedIndex = 1;
            sinkNode.selectedIndex = actualN > 2 ? 2 : 1;
        }
        
        // Renderizar
        const headersAdj = ['', ...Array.from({length: actualN}, (_, i) => numToLetter(i))];
        document.getElementById('adjacency-matrix').innerHTML = renderTable(
            matrizAdyacencia.map((row, i) => [numToLetter(i), ...row]), 
            headersAdj
        );
        
        document.getElementById('adjacency-list').innerHTML = renderList(listaAdyacencia);
        
        const headersInc = ['', ...Array.from({length: edges.length}, (_, i) => i)];
        document.getElementById('incidence-matrix').innerHTML = renderTable(
            matrizIncidencia.map((row, i) => [numToLetter(i), ...row]), 
            headersInc
        );
        
        document.getElementById('edge-list').innerHTML = renderEdgeList(edges);
        
        document.getElementById('max-flow').innerHTML = '<p>Selecciona fuente y sumidero para calcular el flujo máximo.</p>';
        
        // Dibujar el grafo
        drawGraph(actualN, edges);
    });
    
    // Inicializar con una arista
    addEdgeBtn.click();
});