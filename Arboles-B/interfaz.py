import tkinter as tk
from tkinter import messagebox
from arbol_b import ArbolB

class ArbolBGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Visualizador de Árbol B")
        self.root.geometry("1000x800")
        
        # Variables
        self.m = 3
        self.arbol = None
        self.stop_animation = False

        # Constantes de dibujo
        self.KEY_WIDTH = 30
        self.KEY_HEIGHT = 30
        self.NODE_PADDING = 10
        self.V_GAP = 70
        
        # Configuración inicial
        self.setup_ui()
        
    def setup_ui(self):
        # Frame de controles superior
        control_frame = tk.Frame(self.root, pady=10)
        control_frame.pack(fill=tk.X)
        
        # Entrada de M
        tk.Label(control_frame, text="Orden m:").pack(side=tk.LEFT, padx=5)
        self.entry_m = tk.Entry(control_frame, width=5)
        self.entry_m.insert(0, "3")
        self.entry_m.pack(side=tk.LEFT, padx=5)
        
        btn_crear = tk.Button(control_frame, text="Crear/Reiniciar Árbol", command=self.crear_arbol)
        btn_crear.pack(side=tk.LEFT, padx=10)
        
        # Separador visual
        tk.Frame(control_frame, width=20).pack(side=tk.LEFT)
        
        # Inserción manual
        tk.Label(control_frame, text="Valor:").pack(side=tk.LEFT, padx=5)
        self.entry_valor = tk.Entry(control_frame, width=10)
        self.entry_valor.pack(side=tk.LEFT, padx=5)
        self.entry_valor.bind('<Return>', lambda e: self.insertar_valor())
        
        btn_insertar = tk.Button(control_frame, text="Insertar", command=self.insertar_valor)
        btn_insertar.pack(side=tk.LEFT, padx=5)
        
        btn_eliminar = tk.Button(control_frame, text="Eliminar", command=self.eliminar_valor)
        btn_eliminar.pack(side=tk.LEFT, padx=5)

        # Botón Test Animado
        tk.Frame(control_frame, width=20).pack(side=tk.LEFT)
        btn_test = tk.Button(control_frame, text="Tests", command=self.ejecutar_test_animado)
        btn_test.pack(side=tk.LEFT, padx=5)
        
        btn_stop = tk.Button(control_frame, text="Detener", command=self.detener_animacion)
        btn_stop.pack(side=tk.LEFT, padx=5)

        # Etiqueta de Estado
        self.lbl_status = tk.Label(control_frame, text="Estado: Esperando", width=25, fg="blue")
        self.lbl_status.pack(side=tk.LEFT, padx=10)
        
        # Canvas para dibujo
        self.canvas_frame = tk.Frame(self.root)
        self.canvas_frame.pack(fill=tk.BOTH, expand=True)
        
        self.canvas = tk.Canvas(self.canvas_frame, bg="#F0F0F0") # Fondo gris claro mejorado
        self.canvas.pack(fill=tk.BOTH, expand=True)
        
    def crear_arbol(self):
        try:
            m = int(self.entry_m.get())
            if m < 3:
                messagebox.showerror("Error", "El orden m debe ser >= 3")
                return
            self.m = m
            self.arbol = ArbolB(m)
            self.dibujar_arbol()
            print(f"Árbol reiniciado con orden {m}")
        except ValueError:
            messagebox.showerror("Error", "Ingrese un valor entero válido para m")

    def insertar_valor(self, val=None):
        if not self.arbol:
            self.crear_arbol()
            if not self.arbol: return 
            
        try:
            # Si no se pasa valor, leer del entry
            if val is None:
                val_str = self.entry_valor.get()
                if not val_str: return
                val = int(val_str)
                limpiar_entry = True
            else:
                limpiar_entry = False

            # Update status immediately
            self.lbl_status.config(text=f"Estado: Insertando {val}...")
            
            # Schedule insertion after 5 seconds
            self.root.after(5000, lambda: self._real_insertar(val, limpiar_entry))
        except ValueError:
            pass 

    def _real_insertar(self, val, limpiar_entry):
        if self.arbol:
            self.arbol.insertar(val)
            
            if limpiar_entry:
                self.entry_valor.delete(0, tk.END)
                
            self.dibujar_arbol()
            self.lbl_status.config(text=f"Estado: Insertado {val}")

    def eliminar_valor(self, val=None):
        if not self.arbol: return
        
        try:
            if val is None:
                val_str = self.entry_valor.get()
                if not val_str: return
                val = int(val_str)
                limpiar_entry = True
            else:
                limpiar_entry = False

            # Update status immediately
            self.lbl_status.config(text=f"Estado: Eliminando {val}...")
            
            # Schedule deletion after 5 seconds
            self.root.after(5000, lambda: self._real_eliminar(val, limpiar_entry))
        except ValueError:
            pass

    def _real_eliminar(self, val, limpiar_entry):
        if self.arbol:
            self.arbol.eliminar(val)
            
            if limpiar_entry:
                self.entry_valor.delete(0, tk.END)
                
            self.dibujar_arbol()
            self.lbl_status.config(text=f"Estado: Eliminado {val}")

    def detener_animacion(self):
        self.stop_animation = True
        self.lbl_status.config(text="Estado: Detenido")

    def ejecutar_test_animado(self):
        """
        Reinicia el árbol e inserta valores uno a uno con animación.
        """
        self.stop_animation = False
        self.test_m_values = [3, 4, 5, 6]
        self._run_next_test()

    def _run_next_test(self):
        if self.stop_animation:
            return

        if not self.test_m_values:
            messagebox.showinfo("Fin", "Todos los tests completados.")
            self.lbl_status.config(text="Estado: Finalizado")
            return

        m = self.test_m_values.pop(0)
        self.entry_m.delete(0, tk.END)
        self.entry_m.insert(0, str(m))
        self.crear_arbol()
        
        # Secuencia de operaciones: ('I', valor) o ('D', valor)
        # Lista interesante con inserciones y eliminaciones
        ops = [
            ('I', 10), ('I', 20), ('I', 5), ('I', 6), ('I', 12), ('I', 30), 
            ('I', 7), ('I', 17), ('D', 6), ('I', 3), ('I', 11), ('I', 25), 
            ('D', 12), ('I', 22), ('I', 40), ('I', 45), ('I', 2), ('D', 20),
            ('I', 8), ('I', 15), ('I', 35), ('I', 50), ('D', 10), ('I', 55), 
            ('I', 13)
        ]
        self._animar_secuencia(ops, 0)

    def _animar_secuencia(self, ops, idx):
        if self.stop_animation:
            return

        if idx >= len(ops):
            # Pausa antes del siguiente test
            self.lbl_status.config(text="Estado: Pausa entre tests...")
            self.root.after(3000, self._run_next_test)
            return
        
        tipo, val = ops[idx]
        
        # Actualizar UI
        self.entry_valor.delete(0, tk.END)
        self.entry_valor.insert(0, str(val))
        
        if tipo == 'I':
            self.lbl_status.config(text=f"Estado: Insertando {val}...")
            self.insertar_valor(val)
        elif tipo == 'D':
            self.lbl_status.config(text=f"Estado: Eliminando {val}...")
            self.eliminar_valor(val)
            
        self.root.update()
        
        # Delay de 5000ms (más lento)
        self.root.after(5000, lambda: self._animar_secuencia(ops, idx + 1))

    def dibujar_arbol(self):
        self.canvas.delete("all")
        if not self.arbol or not self.arbol.raiz:
            return
            
        self.positions = {}
        
        # Centro del canvas
        canvas_width = self.canvas.winfo_width()
        # Fallback si no se ha mostrado aún
        if canvas_width < 100: canvas_width = 1000
        
        x_center = canvas_width / 2
        
        self._calcular_dimensiones(self.arbol.raiz)
        self._asignar_posiciones(self.arbol.raiz, x_center, 50)
        self._dibujar_nodo_recursivo(self.arbol.raiz)

    def _calcular_dimensiones(self, nodo):
        """
        Calcula el ancho visual de cada subárbol.
        """
        num_claves = len(nodo.claves)
        # Ancho del rectángulo del nodo
        ancho_nodo = max(num_claves * self.KEY_WIDTH + self.NODE_PADDING * 2, 40)
        
        if nodo.hoja:
            self.positions[id(nodo)] = {'width': ancho_nodo, 'node_width': ancho_nodo}
            return ancho_nodo
        
        ancho_hijos = 0
        hijos_widths = []
        for hijo in nodo.hijos:
            w = self._calcular_dimensiones(hijo)
            hijos_widths.append(w)
            ancho_hijos += w
            
        # Espacio entre hijos vecinos
        gap = 15
        ancho_hijos += (len(nodo.hijos) - 1) * gap
        
        total_width = max(ancho_nodo, ancho_hijos)
        self.positions[id(nodo)] = {
            'width': total_width, 
            'node_width': ancho_nodo,
            'hijos_widths': hijos_widths
        }
        return total_width

    def _asignar_posiciones(self, nodo, x_center, y, nivel=0):
        data = self.positions[id(nodo)]
        data['x'] = x_center
        data['y'] = y
        
        if nodo.hoja:
            return

        total_hijos_width = sum(data['hijos_widths']) + (len(nodo.hijos) - 1) * 15
        start_x = x_center - total_hijos_width / 2
        
        current_x = start_x
        for i, hijo in enumerate(nodo.hijos):
            w = data['hijos_widths'][i]
            hijo_x = current_x + w / 2
            self._asignar_posiciones(hijo, hijo_x, y + self.V_GAP, nivel + 1)
            current_x += w + 15

    def _dibujar_nodo_recursivo(self, nodo):
        pos = self.positions[id(nodo)]
        x, y = pos['x'], pos['y']
        node_width = pos['node_width']
        
        # Coordenadas del rectángulo
        x1 = x - node_width / 2
        y1 = y
        x2 = x + node_width / 2
        y2 = y + self.KEY_HEIGHT
        
        color_fondo = "#E0E0FF" if not nodo.hoja else "#E0F0E0"
        if len(nodo.claves) == 0: color_fondo = "#EEEEEE" # Nodo vacío temporal
        
        # Dibujar caja del nodo con borde más grueso
        self.canvas.create_rectangle(x1, y1, x2, y2, fill=color_fondo, outline="black", width=2)
        
        claves = nodo.claves
        num_claves = len(claves)
        
        # Dibujar claves y separadores
        content_width = num_claves * self.KEY_WIDTH
        start_keys_x = x - content_width / 2
        
        # Calcular puntos de conexión (slots) para los hijos
        # Slot 0: Borde izquierdo de primera clave
        # Slot 1: Entre clave 0 y clave 1
        # ...
        # Slot k: Borde derecho de clave k-1
        connection_points = []
        
        # Empezamos con el primer punto: start_keys_x
        # Pero visualmente, queda mejor si las líneas salen de la parte inferior de los separadores.
        
        curr_x = start_keys_x
        connection_points.append(curr_x) # Slot 0
        
        for i, k in enumerate(claves):
            # Dibujar separador izquierdo si i > 0
            if i > 0:
                self.canvas.create_line(curr_x, y1, curr_x, y2, fill="black", width=1)
            
            # Texto
            center_k_x = curr_x + self.KEY_WIDTH / 2
            self.canvas.create_text(center_k_x, y + self.KEY_HEIGHT/2, 
                                    text=str(k), font=("Arial", 10, "bold"))
            
            curr_x += self.KEY_WIDTH
            connection_points.append(curr_x) # Slot i+1

        # Dibujar conexiones a hijos
        if not nodo.hoja:
            for i, hijo in enumerate(nodo.hijos):
                # Validar índice por seguridad
                if i >= len(connection_points):
                    cx = connection_points[-1]
                else:
                    cx = connection_points[i]
                
                cy = y2 # Borde inferior
                
                # Destino: Centro superior del hijo
                h_pos = self.positions[id(hijo)]
                hx, hy = h_pos['x'], h_pos['y']
                
                self.canvas.create_line(cx, cy, hx, hy, fill="#555555", width=1.5)
                
                self._dibujar_nodo_recursivo(hijo)

if __name__ == "__main__":
    root = tk.Tk()
    app = ArbolBGUI(root)
    # Crear árbol inicial
    app.crear_arbol()
    root.mainloop()
