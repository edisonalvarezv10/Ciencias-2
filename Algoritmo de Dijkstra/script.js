// Funciones para crear representaciones
function numToLetter(n) {
    return String.fromCharCode(65 + n); // 65 is 'A'
}

// Variables globales para almacenar resultados de Dijkstra
let dijkstraResult = null;
let currentEdges = [];
let currentN = 0;

// Función para reconstruir el camino más corto usando predecesores
function reconstructPath(start, end, predecessor) {
    if (!predecessor || predecessor[end] === null) return null;

    const path = [];
    let current = end;
    while (current !== null) {
        path.unshift(current);
        if (current === start) break;
        current = predecessor[current];
    }

    if (path[0] !== start) return null;
    return path;
}

// Función para buscar camino más corto
function buscarCaminoMasCorto() {
    const startSel = document.getElementById('start-node');
    const endSel = document.getElementById('end-node');
    const resultDiv = document.getElementById('shortest-path-result');
    
    const start = parseInt(startSel.value);
    const end = parseInt(endSel.value);
    
    if (isNaN(start) || isNaN(end)) {
        alert('Selecciona ambos nodos');
        return;
    }
    
    if (currentEdges.length === 0 || currentN === 0) {
        alert('Genera las representaciones primero');
        return;
    }

    if (currentEdges.some(([, , weight]) => weight < 0)) {
        resultDiv.innerHTML = `<strong>Dijkstra no admite pesos negativos. Ajusta las aristas y vuelve a generar el grafo.</strong>`;
        resultDiv.style.display = 'block';
        return;
    }

    try {
        dijkstraResult = dijkstra(currentN, currentEdges, start);
    } catch (error) {
        resultDiv.innerHTML = `<strong>${error.message}</strong>`;
        resultDiv.style.display = 'block';
        return;
    }
    document.getElementById('shortest-paths').innerHTML = renderDijkstraResults(dijkstraResult, start);
    
    const { distances, predecessor } = dijkstraResult;
    const distance = distances[end];
    if (distance === Infinity) {
        resultDiv.innerHTML = `<strong>No hay camino entre ${numToLetter(start)} y ${numToLetter(end)}</strong>`;
        resultDiv.style.display = 'block';
    } else {
        const path = reconstructPath(start, end, predecessor);
        const pathStr = path ? path.map(numToLetter).join(' → ') : 'No se pudo reconstruir el camino';
        resultDiv.innerHTML = `<strong>Distancia más corta:</strong> ${distance}<br><strong>Camino:</strong> ${pathStr}`;
        resultDiv.style.display = 'block';
    }
}

function crearMatrizAdyacencia(n, edges) {
    const m = Array.from({ length: n }, () => Array(n).fill(0));
    edges.forEach(([src, dst, weight]) => {
        if (src < n && dst < n) {
            m[src][dst] = weight;
            m[dst][src] = weight; // grafo no dirigido
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

class MinPriorityQueue {
    constructor() {
        this.heap = [];
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    push(node, priority) {
        const item = { node, priority };
        this.heap.push(item);
        this._siftUp(this.heap.length - 1);
    }

    pop() {
        if (this.isEmpty()) return null;
        const top = this.heap[0];
        const end = this.heap.pop();
        if (!this.isEmpty()) {
            this.heap[0] = end;
            this._siftDown(0);
        }
        return top;
    }

    _siftUp(index) {
        const item = this.heap[index];
        while (index > 0) {
            const parentIndex = (index - 1) >> 1;
            if (this.heap[parentIndex].priority <= item.priority) break;
            this.heap[index] = this.heap[parentIndex];
            index = parentIndex;
        }
        this.heap[index] = item;
    }

    _siftDown(index) {
        const item = this.heap[index];
        const length = this.heap.length;
        while (true) {
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            let smallest = index;

            if (left < length && this.heap[left].priority < this.heap[smallest].priority) {
                smallest = left;
            }
            if (right < length && this.heap[right].priority < this.heap[smallest].priority) {
                smallest = right;
            }
            if (smallest === index) break;

            this.heap[index] = this.heap[smallest];
            index = smallest;
        }
        this.heap[index] = item;
    }
}

function buildWeightedAdjacency(n, edges) {
    const adjacency = Array.from({ length: n }, () => []);
    edges.forEach(([src, dst, weight]) => {
        if (src < n && dst < n && src !== dst) {
            adjacency[src].push({ node: dst, weight });
            adjacency[dst].push({ node: src, weight });
        }
    });
    return adjacency;
}

function dijkstra(n, edges, source) {
    if (!Number.isInteger(source) || source < 0 || source >= n) {
        throw new Error('Nodo de origen inválido para Dijkstra.');
    }

    if (edges.some(([, , weight]) => weight < 0)) {
        throw new Error('Dijkstra no admite pesos negativos.');
    }

    const adjacency = buildWeightedAdjacency(n, edges);
    const distances = Array(n).fill(Infinity);
    const predecessor = Array(n).fill(null);
    const visited = Array(n).fill(false);
    const pq = new MinPriorityQueue();

    distances[source] = 0;
    pq.push(source, 0);

    while (!pq.isEmpty()) {
        const entry = pq.pop();
        if (!entry) break;

        const u = entry.node;
        const distanceU = entry.priority;

        if (visited[u] || distanceU > distances[u]) continue;
        visited[u] = true;

        adjacency[u].forEach(({ node: v, weight }) => {
            if (visited[v]) return;
            const alt = distanceU + weight;
            if (alt < distances[v]) {
                distances[v] = alt;
                predecessor[v] = u;
                pq.push(v, alt);
            }
        });
    }

    return { distances, predecessor };
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
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', pos1.x);
            line.setAttribute('y1', pos1.y);
            line.setAttribute('x2', pos2.x);
            line.setAttribute('y2', pos2.y);
            line.setAttribute('stroke', '#333');
            line.setAttribute('stroke-width', '2');
            svg.appendChild(line);
            
            // Etiqueta de peso
            const midX = (pos1.x + pos2.x) / 2;
            const midY = (pos1.y + pos2.y) / 2;
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', midX);
            text.setAttribute('y', midY);
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
        html += `<li>${numToLetter(a)} — ${numToLetter(b)} (peso: ${w})</li>`;
    });
    html += '</ul>';
    return html;
}

function renderDijkstraResults(result, source) {
    if (!result) return '<p>Genera el grafo para ver los resultados de Dijkstra.</p>';
    const { distances } = result;

    const matrix = distances.map((value, i) => [numToLetter(i), value === Infinity ? '∞' : value]);
    return renderTable(matrix, ['', 'Distancia']) + `<p>Origen: <strong>${numToLetter(source)}</strong></p>`;
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
            <span> Peso: </span>
            <input type="number" class="weight" min="0" value="1">
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
            const weight = parseInt(edgeDiv.querySelector('.weight').value) || 1;
            if (!isNaN(from) && !isNaN(to)) {
                edges.push([from, to, weight]);
            }
        });
        
        if (edges.some(([, , weight]) => weight < 0)) {
            alert('Dijkstra no admite pesos negativos. Ajusta las aristas para que los pesos sean mayores o iguales a cero.');
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
        const startNode = document.getElementById('start-node');
        const endNode = document.getElementById('end-node');
        startNode.innerHTML = '<option value="">Seleccionar nodo origen</option>';
        endNode.innerHTML = '<option value="">Seleccionar nodo destino</option>';
        
        currentEdges = edges;
        currentN = actualN;
        
        for (let i = 0; i < actualN; i++) {
            const optStart = document.createElement('option');
            optStart.value = i;
            optStart.textContent = numToLetter(i);
            startNode.appendChild(optStart);
            
            const optEnd = document.createElement('option');
            optEnd.value = i;
            optEnd.textContent = numToLetter(i);
            endNode.appendChild(optEnd);
        }
        
        // Usar el primer nodo como origen predeterminado para Dijkstra
        if (actualN > 1) {
            startNode.selectedIndex = 1;
            endNode.selectedIndex = 1;
        }
        const defaultSource = parseInt(startNode.value) || 0;
        try {
            dijkstraResult = dijkstra(actualN, edges, defaultSource);
        } catch (error) {
            alert(error.message);
            return;
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
        
        document.getElementById('shortest-paths').innerHTML = renderDijkstraResults(dijkstraResult, defaultSource);
        
        // Dibujar el grafo
        drawGraph(actualN, edges);
    });
    
    // Inicializar con una arista
    addEdgeBtn.click();
});