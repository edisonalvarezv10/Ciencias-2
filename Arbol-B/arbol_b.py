import math

class NodoArbolB:
    def __init__(self, hoja=True):
        self.hoja = hoja
        self.claves = []
        self.hijos = []

    def __str__(self):
        return f"Claves: {self.claves}"

class ArbolB:
    def __init__(self, m):
        if m < 3:
            raise ValueError("El orden del Árbol B debe ser al menos 3.")
        self.raiz = NodoArbolB(True)
        self.m = m
        self.min_claves = math.floor(m / 2) - 1
        if self.min_claves < 1:
            self.min_claves = 1

    def buscar(self, k, nodo=None):
        if nodo is None:
            nodo = self.raiz

        i = 0
        while i < len(nodo.claves) and k > nodo.claves[i]:
            i += 1

        if i < len(nodo.claves) and k == nodo.claves[i]:
            return (nodo, i)

        if nodo.hoja:
            return None

        return self.buscar(k, nodo.hijos[i])

    def insertar(self, k):
        self._insertar_recursivo(self.raiz, k)
        
        if len(self.raiz.claves) > self.m - 1:
            old_raiz = self.raiz
            new_raiz = NodoArbolB(False)
            new_raiz.hijos.append(old_raiz)
            
            self._dividir_hijo_overflow(new_raiz, 0)
            self.raiz = new_raiz

    def _insertar_recursivo(self, nodo, k):
        i = 0
        while i < len(nodo.claves) and k > nodo.claves[i]:
            i += 1
            
        if nodo.hoja:
            nodo.claves.insert(i, k)
        else:
            self._insertar_recursivo(nodo.hijos[i], k)
            
            if len(nodo.hijos[i].claves) > self.m - 1:
                self._dividir_hijo_overflow(nodo, i)

    def _dividir_hijo_overflow(self, padre, i):
        hijo = padre.hijos[i]
        
        mid_idx = len(hijo.claves) // 2
        
        clave_media = hijo.claves[mid_idx]
        
        nuevo_nodo = NodoArbolB(hijo.hoja)
        nuevo_nodo.claves = hijo.claves[mid_idx + 1:]
        
        padre.claves.insert(i, clave_media)
        padre.hijos.insert(i + 1, nuevo_nodo)
        
        if not hijo.hoja:
            nuevo_nodo.hijos = hijo.hijos[mid_idx + 1:]
            hijo.hijos = hijo.hijos[:mid_idx + 1]
            
        hijo.claves = hijo.claves[:mid_idx]

    def eliminar(self, k):
        if not self.raiz.claves:
            return
        
        self._eliminar_interno(self.raiz, k)
        
        if len(self.raiz.claves) == 0:
            if not self.raiz.hoja:
                self.raiz = self.raiz.hijos[0]
            else:
                pass 

    def _eliminar_interno(self, nodo, k):
        idx = 0
        while idx < len(nodo.claves) and k > nodo.claves[idx]:
            idx += 1
        
        if idx < len(nodo.claves) and nodo.claves[idx] == k:
            if nodo.hoja:
                nodo.claves.pop(idx)
            else:
                predecesor = self._obtener_predecesor(nodo, idx)
                nodo.claves[idx] = predecesor
                self._eliminar_interno(nodo.hijos[idx], predecesor)
                if len(nodo.hijos[idx].claves) < self.min_claves:
                    self._rebalancear(nodo, idx)
        else:
            if nodo.hoja:
                return 
            
            flag_ultima_rama = (idx == len(nodo.claves))
            hijo = nodo.hijos[idx]
            self._eliminar_interno(hijo, k)
            
            if len(hijo.claves) < self.min_claves:
                self._rebalancear(nodo, idx)

    def _obtener_predecesor(self, nodo, idx):
        actual = nodo.hijos[idx]
        while not actual.hoja:
            actual = actual.hijos[-1]
        return actual.claves[-1]

    def _rebalancear(self, padre, idx_hijo):
        izquierda_ok = (idx_hijo > 0)
        derecha_ok = (idx_hijo < len(padre.hijos) - 1)
        
        if izquierda_ok:
            hermano_izq = padre.hijos[idx_hijo - 1]
            if len(hermano_izq.claves) > self.min_claves:
                self._pedir_prestado_de_izquierda(padre, idx_hijo)
                return

        if derecha_ok:
            hermano_der = padre.hijos[idx_hijo + 1]
            if len(hermano_der.claves) > self.min_claves:
                self._pedir_prestado_de_derecha(padre, idx_hijo)
                return
        
        if izquierda_ok:
            self._fusionar(padre, idx_hijo - 1)
        elif derecha_ok:
            self._fusionar(padre, idx_hijo)

    def _pedir_prestado_de_izquierda(self, padre, idx_hijo):
        hijo = padre.hijos[idx_hijo]
        hermano = padre.hijos[idx_hijo - 1]
        hijo.claves.insert(0, padre.claves[idx_hijo - 1])
        padre.claves[idx_hijo - 1] = hermano.claves.pop()
        if not hijo.hoja:
            hijo.hijos.insert(0, hermano.hijos.pop())

    def _pedir_prestado_de_derecha(self, padre, idx_hijo):
        hijo = padre.hijos[idx_hijo]
        hermano = padre.hijos[idx_hijo + 1]
        hijo.claves.append(padre.claves[idx_hijo])
        padre.claves[idx_hijo] = hermano.claves.pop(0)
        if not hijo.hoja:
            hijo.hijos.append(hermano.hijos.pop(0))

    def _fusionar(self, padre, idx):
        hijo_izq = padre.hijos[idx]
        hijo_der = padre.hijos[idx + 1]
        clave_padre = padre.claves.pop(idx)
        hijo_izq.claves.append(clave_padre)
        hijo_izq.claves.extend(hijo_der.claves)
        if not hijo_izq.hoja:
            hijo_izq.hijos.extend(hijo_der.hijos)
        padre.hijos.pop(idx + 1)
