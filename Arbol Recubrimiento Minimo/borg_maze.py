# UVa 10307 - Killing Aliens in Borg Maze
# Enfoque: BFS entre puntos clave (S y A) + MST con Prim

from collections import deque
import sys
input = sys.stdin.readline

INF = float('inf')

# Direcciones: Norte, Sur, Este, Oeste
DIRS = [(-1,0),(1,0),(0,1),(0,-1)]

def bfs(sr, sc, rows, cols, maze):
    """BFS desde (sr,sc) — devuelve matriz de distancias mínimas."""
    dist = [[-1]*cols for _ in range(rows)]
    dist[sr][sc] = 0
    q = deque()
    q.append((sr, sc))
    while q:
        r, c = q.popleft()
        for dr, dc in DIRS:
            nr, nc = r+dr, c+dc
            if 0 <= nr < rows and 0 <= nc < cols and maze[nr][nc] != '#' and dist[nr][nc] == -1:
                dist[nr][nc] = dist[r][c] + 1
                q.append((nr, nc))
    return dist

def prim(n, w):
    """MST de Prim sobre grafo completo de n nodos. Retorna peso total."""
    min_edge = [INF] * n
    in_mst   = [False] * n
    min_edge[0] = 0
    total = 0

    for _ in range(n):
        # Nodo no visitado con arista mínima al MST actual
        u = -1
        for v in range(n):
            if not in_mst[v] and (u == -1 or min_edge[v] < min_edge[u]):
                u = v

        in_mst[u] = True
        total += min_edge[u]

        # Actualizar costos mínimos hacia vecinos
        for v in range(n):
            if not in_mst[v] and w[u][v] < min_edge[v]:
                min_edge[v] = w[u][v]

    return total

def solve():
    T = int(input())
    for _ in range(T):
        cols, rows = map(int, input().split())

        maze = []
        for _ in range(rows):
            line = sys.stdin.readline().rstrip('\n')
            # Rellenar con espacios si la línea es más corta (espacios finales recortados)
            while len(line) < cols:
                line += ' '
            maze.append(line)

        # Recolectar puntos clave: S al inicio, luego todos los A
        key_points = []
        start = None
        for r in range(rows):
            for c in range(cols):
                if maze[r][c] == 'S':
                    start = (r, c)
                elif maze[r][c] == 'A':
                    key_points.append((r, c))

        key_points.insert(0, start)  # S siempre en índice 0
        n = len(key_points)

        # Sin aliens → costo 0
        if n <= 1:
            print(0)
            continue

        # Distancias entre todos los pares de puntos clave (BFS)
        w = [[INF]*n for _ in range(n)]
        for i, (r, c) in enumerate(key_points):
            dist = bfs(r, c, rows, cols, maze)
            for j, (rj, cj) in enumerate(key_points):
                if dist[rj][cj] != -1:
                    w[i][j] = dist[rj][cj]

        # MST → respuesta
        print(prim(n, w))

solve()
