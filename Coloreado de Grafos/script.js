/* ============================================================
   COLOREADO DE GRAFOS
   Algoritmos: Voraz, Welsh-Powell, DSatur
   + Representaciones: Matriz Adyacencia, Lista Adyacencia,
     Matriz Incidencia, Lista Aristas
   + Visualización con Canvas
   ============================================================ */

'use strict';

// ----------------------------------------------------------
// PALETA DE COLORES (nodos del grafo)
// ----------------------------------------------------------
const PALETTE = [
    '#ff5c5c', '#5b8fff', '#3ecf8e', '#f5a623',
    '#c084fc', '#fb7185', '#34d399', '#60a5fa',
    '#fbbf24', '#a78bfa', '#f472b6', '#4ade80'
];

const COLOR_NAMES = [
    'Rojo', 'Azul', 'Verde', 'Ámbar',
    'Violeta', 'Rosa', 'Esmeralda', 'Celeste',
    'Dorado', 'Lavanda', 'Fucsia', 'Lima'
];

// Etiquetas de letras para nodos (A, B, C, …, Z, AA, AB, …)
function nodeLabel(i) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (i < 26) return letters[i];
    return letters[Math.floor(i / 26) - 1] + letters[i % 26];
}

// Grafos de ejemplo predefinidos
const PRESETS = {
    ciclo: {
        n: 5,
        edges: [[0,1],[1,2],[2,3],[3,4],[4,0]]
    },
    bipartito: {
        n: 6,
        edges: [[0,3],[0,4],[0,5],[1,3],[1,4],[2,3],[2,5]]
    },
    petersen: {
        // Grafo de Petersen clásico (10 nodos, 3-regular)
        // Número cromático = 3. Los tres algoritmos pueden dar 3 o 4.
        n: 10,
        edges: [
            // Ciclo externo: A-B-C-D-E-A
            [0,1],[1,2],[2,3],[3,4],[4,0],
            // Radios al anillo interno
            [0,5],[1,6],[2,7],[3,8],[4,9],
            // Estrella interna: F-H-J-G-I-F (pentágono saltado)
            [5,7],[7,9],[9,6],[6,8],[8,5]
        ]
    },
    completo: {
        n: 4,
        edges: [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]
    }
};

// ----------------------------------------------------------
// GRAFO PREDEFINIDO de demostración (cargado al inicio)
// Grafo "Mycielski M4" extendido — 11 nodos, número cromático 4
// Los tres algoritmos producen resultados distintos (3, 4 o 4 colores).
// ----------------------------------------------------------
const DEFAULT_GRAPH = {
    n: 11,
    edges: [
        // Triángulo base A-B-C
        [0,1],[1,2],[0,2],
        // D conectado a B y C
        [3,1],[3,2],
        // E conectado a A y C
        [4,0],[4,2],
        // F conectado a A y B
        [5,0],[5,1],
        // G conectado a D, E, F
        [6,3],[6,4],[6,5],
        // H conectado a A, D, G
        [7,0],[7,3],[7,6],
        // I conectado a B, E, G
        [8,1],[8,4],[8,6],
        // J conectado a C, F, G
        [9,2],[9,5],[9,6],
        // K (hub) conectado a H, I, J y también a D, E, F
        [10,7],[10,8],[10,9],[10,3],[10,4],[10,5]
    ]
};

// ----------------------------------------------------------
// ESTADO GLOBAL
// ----------------------------------------------------------
let state = {
    edges: DEFAULT_GRAPH.edges,
    results: null,
    activeAlgo: 'voraz',
    activeMtab: 'adj',
    graph: null
};

// ----------------------------------------------------------
// ===  REPRESENTACIONES DE GRAFOS  ===
// ----------------------------------------------------------

/** Construye lista de adyacencia (array de arrays) */
function buildAdjList(n, edges) {
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(([a, b]) => {
        if (a === b) return; // ignorar self-loops
        if (a < n && b < n) {
            adj[a].push(b);
            adj[b].push(a);
        }
    });
    return adj;
}

/** Matriz de adyacencia n×n */
function buildAdjMatrix(n, edges) {
    const m = Array.from({ length: n }, () => Array(n).fill(0));
    edges.forEach(([a, b]) => {
        if (a !== b && a < n && b < n) {
            m[a][b] = 1;
            m[b][a] = 1;
        }
    });
    return m;
}

/** Matriz de incidencia n×|E| */
function buildIncidenceMatrix(n, edges) {
    const m = Array.from({ length: n }, () => Array(edges.length).fill(0));
    edges.forEach(([a, b], idx) => {
        if (a < n && b < n) {
            if (a !== b) {
                m[a][idx] = 1;
                m[b][idx] = 1;
            } else {
                m[a][idx] = 2; // self-loop
            }
        }
    });
    return m;
}

// ----------------------------------------------------------
// ===  ALGORITMOS DE COLOREADO  ===
// ----------------------------------------------------------

/**
 * ALGORITMO VORAZ (Greedy)
 * Recorre los nodos en orden natural (0, 1, 2 …) y asigna a
 * cada uno el color de índice más bajo que no use ninguno de
 * sus vecinos ya coloreados.
 *
 * Complejidad: O(V + E)
 * No garantiza el óptimo, pero es simple y rápido.
 */
function algorithmVoraz(n, adj) {
    const color = new Array(n).fill(-1);
    const steps = [];

    for (let v = 0; v < n; v++) {
        // Colores usados por los vecinos ya procesados
        const usedColors = new Set(
            adj[v].map(u => color[u]).filter(c => c >= 0)
        );

        // Primer color disponible
        let c = 0;
        while (usedColors.has(c)) c++;

        color[v] = c;

        const vecInfo = adj[v]
            .filter(u => color[u] >= 0)
            .map(u => `${nodeLabel(u)}→${COLOR_NAMES[color[u]]}`)
            .join(', ') || '—';

        steps.push(
            `Nodo <span>${nodeLabel(v)}</span>: vecinos coloreados [${vecInfo}] ` +
            `→ asignado <span>${COLOR_NAMES[c]}</span>`
        );
    }

    return {
        id: 'voraz',
        name: 'Voraz',
        desc: 'Recorre los nodos en orden 0, 1, 2… y asigna a cada uno ' +
              'el primer color no usado por sus vecinos. Simple y O(V+E), ' +
              'pero el resultado depende del orden de los nodos.',
        color,
        steps,
        chromatic: new Set(color).size
    };
}

/**
 * ALGORITMO WELSH-POWELL
 * 1. Ordena los nodos de MAYOR a MENOR grado.
 * 2. Aplica la heurística voraz en ese orden.
 *
 * Al procesar primero los nodos más conectados se reduce la
 * probabilidad de necesitar colores adicionales.
 * Complejidad: O(V log V + E)
 */
function algorithmWelshPowell(n, adj) {
    // Paso 1 – ordenar por grado descendente (empate: menor índice primero)
    const order = Array.from({ length: n }, (_, i) => i)
        .sort((a, b) => adj[b].length - adj[a].length || a - b);

    const color = new Array(n).fill(-1);
    const steps = [];

    const orderStr = order.map(v => `${nodeLabel(v)}(gr=${adj[v].length})`).join(', ');
    steps.push(`Orden por grado desc: <span>${orderStr}</span>`);

    for (const v of order) {
        const usedColors = new Set(
            adj[v].map(u => color[u]).filter(c => c >= 0)
        );

        let c = 0;
        while (usedColors.has(c)) c++;

        color[v] = c;

        const vecInfo = adj[v]
            .filter(u => color[u] >= 0)
            .map(u => `${nodeLabel(u)}→${COLOR_NAMES[color[u]]}`)
            .join(', ') || '—';

        steps.push(
            `Nodo <span>${nodeLabel(v)}</span> (gr=${adj[v].length}): ` +
            `vecinos [${vecInfo}] → <span>${COLOR_NAMES[c]}</span>`
        );
    }

    return {
        id: 'welsh',
        name: 'Welsh-Powell',
        desc: 'Ordena los nodos de mayor a menor grado y aplica la ' +
              'heurística voraz. Al tratar primero los más conectados ' +
              'suele necesitar menos colores que el Voraz puro.',
        color,
        steps,
        chromatic: new Set(color).size
    };
}

/**
 * ALGORITMO DSATUR (Degree of SATURation)
 * En cada iteración elige el nodo no coloreado con mayor
 * saturación (= nº de colores DISTINTOS en sus vecinos).
 * En caso de empate de saturación, elige el de mayor grado.
 *
 * Propuesto por Brélaz (1979). Produce resultados óptimos en
 * muchos grafos y es generalmente el mejor de los tres.
 * Complejidad: O(V² ) con implementación básica.
 */
function algorithmDSatur(n, adj) {
    const color       = new Array(n).fill(-1);
    const saturation  = new Array(n).fill(0);         // saturación de cada nodo
    const adjColorSet = Array.from({ length: n }, () => new Set()); // colores distintos en vecinos
    const colored     = new Set();
    const steps       = [];

    for (let iter = 0; iter < n; iter++) {
        // Elegir nodo con mayor saturación (desempate por grado)
        let best = -1;
        for (let v = 0; v < n; v++) {
            if (colored.has(v)) continue;
            if (
                best === -1 ||
                saturation[v] > saturation[best] ||
                (saturation[v] === saturation[best] && adj[v].length > adj[best].length)
            ) {
                best = v;
            }
        }

        // Primer color disponible para `best`
        let c = 0;
        while (adjColorSet[best].has(c)) c++;

        color[best] = c;
        colored.add(best);

        // Actualizar saturación de los vecinos de `best`
        adj[best].forEach(u => {
            if (!adjColorSet[u].has(c)) {
                adjColorSet[u].add(c);
                saturation[u]++;
            }
        });

        steps.push(
            `Iter ${iter + 1}: nodo <span>${nodeLabel(best)}</span> ` +
            `(sat=${saturation[best]}, gr=${adj[best].length}) ` +
            `→ <span>${COLOR_NAMES[c]}</span>`
        );
    }

    return {
        id: 'dsatur',
        name: 'DSatur',
        desc: 'En cada paso elige el nodo no coloreado con mayor ' +
              'saturación (número de colores distintos en sus vecinos). ' +
              'Produce coloraciones óptimas o muy cercanas al óptimo en ' +
              'la mayoría de los grafos.',
        color,
        steps,
        chromatic: new Set(color).size
    };
}

// ----------------------------------------------------------
// ===  RENDERIZADO UI  ===
// ----------------------------------------------------------

function getNodeCount() {
    const raw = parseInt(document.getElementById('nodos').value);
    return isNaN(raw) || raw < 1 ? 1 : raw;
}

function getEdges() {
    const rows = document.querySelectorAll('#edges-container .edge-input');
    const edges = [];
    const seen  = new Set();

    rows.forEach(div => {
        const a = parseInt(div.querySelector('.from').value);
        const b = parseInt(div.querySelector('.to').value);
        if (isNaN(a) || isNaN(b) || a === b) return;
        const key = Math.min(a, b) + '-' + Math.max(a, b);
        if (!seen.has(key)) {
            seen.add(key);
            edges.push([a, b]);
        }
    });

    return edges;
}

function computeN(nInput, edges) {
    let maxNode = nInput - 1;
    edges.forEach(([a, b]) => { maxNode = Math.max(maxNode, a, b); });
    return maxNode + 1;
}

/** Genera opciones de letras para un <select> hasta maxN nodos */
function buildLetterOptions(selected, maxN) {
    return Array.from({ length: maxN }, (_, i) => {
        const lbl = nodeLabel(i);
        return `<option value="${i}" ${i === selected ? 'selected' : ''}>${lbl}</option>`;
    }).join('');
}

/** Crea una fila de arista en el contenedor */
function createEdgeRow(from = 0, to = 1) {
    const maxN = parseInt(document.getElementById('nodos').value) || 20;
    const div = document.createElement('div');
    div.className = 'edge-input';
    div.innerHTML = `
        <select class="from edge-select">${buildLetterOptions(from, maxN)}</select>
        <span class="edge-sep">—</span>
        <select class="to edge-select">${buildLetterOptions(to, maxN)}</select>
        <button class="btn-del" title="Eliminar arista">✕</button>
    `;
    div.querySelector('.btn-del').addEventListener('click', () => div.remove());
    return div;
}

function renderEdgeList(edges) {
    const container = document.getElementById('edges-container');
    container.innerHTML = '';
    edges.forEach(([a, b]) => container.appendChild(createEdgeRow(a, b)));
}

// ------ Pestaña algoritmo ------
function renderAlgoTab(result) {
    const usedColors = [...new Set(result.color)].sort((a, b) => a - b);

    const assignmentHTML = result.color.map((c, v) => `
        <div class="color-item">
            <div class="color-dot" style="background:${PALETTE[c]}"></div>
            <span>Nodo ${nodeLabel(v)} → ${COLOR_NAMES[c]}</span>
        </div>
    `).join('');

    const stepsHTML = result.steps
        .map((s, i) => `<div class="step-line">${i + 1}. ${s}</div>`)
        .join('');

    return `
        <p class="algo-desc">${result.desc}</p>
        <div class="color-assignment">${assignmentHTML}</div>
        <div class="steps-section">
            <span class="steps-label">Pasos del algoritmo</span>
            <div class="steps-box">${stepsHTML}</div>
        </div>
    `;
}

// ------ Número cromático ------
function renderChromatic(results) {
    const best = Math.min(...results.map(r => r.chromatic));
    const container = document.getElementById('chromatic-row');
    container.innerHTML = results.map(r => `
        <div class="chroma-card ${r.chromatic === best ? 'best' : ''}">
            <div class="chroma-label">${r.name}</div>
            <div class="chroma-num">${r.chromatic}</div>
            <div class="chroma-sub">χ — colores usados</div>
        </div>
    `).join('');
}

// ------ Contenido de tabs de algoritmo ------
function renderTabContent() {
    const result = state.results.find(r => r.id === state.activeAlgo);
    document.getElementById('tab-content').innerHTML = renderAlgoTab(result);
}

// ------ Matrices ------
function renderMatrices(n, edges, adj) {
    const { activeMtab } = state;
    const container = document.getElementById('matrix-content');

    if (activeMtab === 'adj') {
        const m = buildAdjMatrix(n, edges);
        const headers = ['', ...Array.from({ length: n }, (_, i) => nodeLabel(i))];
        let html = '<table><thead><tr>';
        headers.forEach(h => html += `<th>${h}</th>`);
        html += '</tr></thead><tbody>';
        m.forEach((row, i) => {
            html += `<tr><td class="row-header">${nodeLabel(i)}</td>`;
            row.forEach(cell => {
                html += `<td class="${cell === 1 ? 'cell-one' : ''}">${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        container.innerHTML = html;

    } else if (activeMtab === 'list') {
        let html = '<ul class="adj-list">';
        adj.forEach((neighbors, i) => {
            html += `<li><strong>${nodeLabel(i)}:</strong>  [${neighbors.map(nodeLabel).join(', ')}]</li>`;
        });
        html += '</ul>';
        container.innerHTML = html;

    } else if (activeMtab === 'inc') {
        const m = buildIncidenceMatrix(n, edges);
        if (edges.length === 0) {
            container.innerHTML = '<p style="font-family:var(--font-mono);font-size:12px;color:var(--text3)">Sin aristas</p>';
            return;
        }
        let html = '<table><thead><tr><th></th>';
        edges.forEach((_, j) => html += `<th>e${j}</th>`);
        html += '</tr></thead><tbody>';
        m.forEach((row, i) => {
            html += `<tr><td class="row-header">${nodeLabel(i)}</td>`;
            row.forEach(cell => html += `<td class="${cell > 0 ? 'cell-one' : ''}">${cell}</td>`);
            html += '</tr>';
        });
        html += '</tbody></table>';
        container.innerHTML = html;

    } else if (activeMtab === 'elist') {
        if (edges.length === 0) {
            container.innerHTML = '<p style="font-family:var(--font-mono);font-size:12px;color:var(--text3)">Sin aristas</p>';
            return;
        }
        let html = '<ul class="edge-list">';
        edges.forEach(([a, b], i) => {
            html += `<li>e${i}: <strong>${nodeLabel(a)}</strong> — <strong>${nodeLabel(b)}</strong></li>`;
        });
        html += '</ul>';
        container.innerHTML = html;
    }
}

// ----------------------------------------------------------
// ===  CANVAS – VISUALIZACIÓN DEL GRAFO  ===
// ----------------------------------------------------------

function drawGraph(n, adj, edges, colorArr) {
    const canvas = document.getElementById('graphCanvas');
    const dpr    = window.devicePixelRatio || 1;
    const W      = canvas.offsetWidth;
    const H      = canvas.offsetHeight || 340;

    canvas.width  = W * dpr;
    canvas.height = H * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    // Posiciones de nodos en círculo (con un ligero offset para que no queden
    // todos arriba si sólo hay un nodo)
    const cx = W / 2, cy = H / 2;
    const R  = Math.min(W, H) * 0.36;

    const pos = Array.from({ length: n }, (_, i) => {
        const angle = (2 * Math.PI * i / n) - Math.PI / 2;
        return [cx + R * Math.cos(angle), cy + R * Math.sin(angle)];
    });

    // Radio del nodo según densidad
    const nodeR = Math.max(12, Math.min(22, 200 / Math.max(n, 1)));

    // --- Aristas ---
    edges.forEach(([a, b]) => {
        if (a >= n || b >= n) return;
        ctx.beginPath();
        ctx.moveTo(pos[a][0], pos[a][1]);
        ctx.lineTo(pos[b][0], pos[b][1]);
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth   = 1.5;
        ctx.stroke();
    });

    // --- Nodos ---
    pos.forEach(([x, y], i) => {
        const c = colorArr[i] >= 0 ? PALETTE[colorArr[i]] : '#555';

        // Sombra suave del color
        ctx.shadowColor   = c;
        ctx.shadowBlur    = 12;

        ctx.beginPath();
        ctx.arc(x, y, nodeR, 0, 2 * Math.PI);
        ctx.fillStyle = c;
        ctx.fill();

        ctx.shadowBlur = 0;

        // Borde
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth   = 1.5;
        ctx.stroke();

        // Letra del nodo
        ctx.fillStyle    = '#fff';
        ctx.font         = `700 ${Math.max(9, nodeR * 0.68)}px 'JetBrains Mono', monospace`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(nodeLabel(i), x, y);
    });

    // --- Leyenda ---
    const usedColors = [...new Set(colorArr.filter(c => c >= 0))].sort((a, b) => a - b);
    const legend = document.getElementById('legend');
    legend.innerHTML = usedColors.map(c => `
        <div class="legend-item">
            <div class="legend-dot" style="background:${PALETTE[c]}"></div>
            ${COLOR_NAMES[c]}
        </div>
    `).join('');
}

// ----------------------------------------------------------
// ===  EJECUCIÓN PRINCIPAL  ===
// ----------------------------------------------------------

function runAlgorithms() {
    const nInput = getNodeCount();
    const rawEdges = getEdges();
    const n = computeN(nInput, rawEdges);

    if (n > 20) {
        alert('Máximo 20 nodos soportados en la visualización.');
        return;
    }

    const adj = buildAdjList(n, rawEdges);

    // Ejecutar los tres algoritmos
    const results = [
        algorithmVoraz(n, adj),
        algorithmWelshPowell(n, adj),
        algorithmDSatur(n, adj)
    ];

    state.results = results;
    state.graph   = { n, adj, edges: rawEdges };

    // Mostrar sección de resultados
    document.getElementById('empty-state').style.display   = 'none';
    document.getElementById('results-content').style.display = 'flex';
    document.getElementById('results-content').style.flexDirection = 'column';
    document.getElementById('results-content').style.gap = '1.4rem';

    renderChromatic(results);
    renderTabContent();
    renderMatrices(n, rawEdges, adj);

    // Sincronizar select de visualización con la pestaña activa
    document.getElementById('viz-algo').value = state.activeAlgo;
    const activeResult = results.find(r => r.id === state.activeAlgo);
    setTimeout(() => drawGraph(n, adj, rawEdges, activeResult.color), 50);
}

/** Actualiza las opciones de letra en todos los selects de aristas */
function refreshEdgeSelects() {
    const maxN = parseInt(document.getElementById('nodos').value) || 20;
    document.querySelectorAll('#edges-container .edge-input').forEach(div => {
        const fromSel = div.querySelector('.from');
        const toSel   = div.querySelector('.to');
        const fromVal = parseInt(fromSel.value);
        const toVal   = parseInt(toSel.value);
        fromSel.innerHTML = buildLetterOptions(Math.min(fromVal, maxN - 1), maxN);
        toSel.innerHTML   = buildLetterOptions(Math.min(toVal,   maxN - 1), maxN);
    });
}

// ----------------------------------------------------------
// ===  EVENTOS  ===
// ----------------------------------------------------------

document.addEventListener('DOMContentLoaded', function () {

    // Cargar grafo de demostración predefinido
    document.getElementById('nodos').value = DEFAULT_GRAPH.n;
    state.edges = DEFAULT_GRAPH.edges;
    renderEdgeList(DEFAULT_GRAPH.edges);

    // Botones +/- nodos
    document.getElementById('btn-minus').addEventListener('click', () => {
        const input = document.getElementById('nodos');
        const v = parseInt(input.value);
        if (!isNaN(v) && v > 1) { input.value = v - 1; refreshEdgeSelects(); }
    });

    document.getElementById('btn-plus').addEventListener('click', () => {
        const input = document.getElementById('nodos');
        const v = parseInt(input.value);
        if (!isNaN(v) && v < 20) { input.value = v + 1; refreshEdgeSelects(); }
    });

    // Agregar arista
    document.getElementById('add-edge').addEventListener('click', () => {
        const container = document.getElementById('edges-container');
        container.appendChild(createEdgeRow(0, 1));
        // Scroll al último
        container.scrollTop = container.scrollHeight;
    });

    // Presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = PRESETS[btn.dataset.preset];
            if (!preset) return;
            document.getElementById('nodos').value = preset.n;
            state.edges = preset.edges;
            renderEdgeList(preset.edges);
        });
    });

    // Ejecutar
    document.getElementById('generate').addEventListener('click', runAlgorithms);

    // Tabs de algoritmo
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.activeAlgo = tab.dataset.algo;
            renderTabContent();
            // Sincronizar visualización
            if (state.graph && state.results) {
                document.getElementById('viz-algo').value = state.activeAlgo;
                const r = state.results.find(x => x.id === state.activeAlgo);
                const { n, adj, edges } = state.graph;
                drawGraph(n, adj, edges, r.color);
            }
        });
    });

    // Select de visualización
    document.getElementById('viz-algo').addEventListener('change', function () {
        state.activeAlgo = this.value;
        // Sincronizar tabs
        document.querySelectorAll('.tab').forEach(t => {
            t.classList.toggle('active', t.dataset.algo === state.activeAlgo);
        });
        renderTabContent();
        if (state.graph && state.results) {
            const r = state.results.find(x => x.id === state.activeAlgo);
            const { n, adj, edges } = state.graph;
            drawGraph(n, adj, edges, r.color);
        }
    });

    // Tabs de matrices
    document.querySelectorAll('.mtab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.mtab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.activeMtab = tab.dataset.mtab;
            if (state.graph) {
                const { n, edges, adj } = state.graph;
                renderMatrices(n, edges, adj);
            }
        });
    });

    // Redibujar canvas en resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (state.graph && state.results) {
                const r = state.results.find(x => x.id === state.activeAlgo);
                const { n, adj, edges } = state.graph;
                drawGraph(n, adj, edges, r.color);
            }
        }, 150);
    });

    // Ejecutar automáticamente con el grafo de demostración
    setTimeout(runAlgorithms, 80);
});
