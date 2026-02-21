import tkinter as tk
from tkinter import messagebox

# Edison David Alvarez Varela - 20222020043
# Miguel Angel Pedroza Vanegas - 20222020062
# Mauricio Sánchez Aguilar - 20212020045
# Johan Camilo Gomez Blanco - 20222020069



# -----------------------------
# Funciones de cifrado/descifrado
# -----------------------------

def cifrar_cesar_ascii(texto, clave):
    resultado = ""
    clave = [int(d) for d in clave]
    n = len(clave)

    for i, char in enumerate(texto):
        codigo = ord(char)

        if 32 <= codigo <= 126:
            desplazamiento = clave[i % n]
            nuevo_codigo = ((codigo - 32 + desplazamiento) % 95) + 32
            resultado += chr(nuevo_codigo)
        else:
            resultado += char

    return resultado


def descifrar_cesar_ascii(texto, clave):
    resultado = ""
    clave = [int(d) for d in clave]
    n = len(clave)

    for i, char in enumerate(texto):
        codigo = ord(char)

        if 32 <= codigo <= 126:
            desplazamiento = clave[i % n]
            nuevo_codigo = ((codigo - 32 - desplazamiento) % 95) + 32
            resultado += chr(nuevo_codigo)
        else:
            resultado += char

    return resultado


# -----------------------------
# Funciones de la interfaz
# -----------------------------

def cifrar():
    texto = entrada_texto.get("1.0", tk.END).rstrip("\n")
    clave = entrada_clave.get()

    if not clave.isdigit():
        messagebox.showerror("Error", "La clave debe ser numérica")
        return

    resultado = cifrar_cesar_ascii(texto, clave)

    salida.delete("1.0", tk.END)
    salida.insert(tk.END, resultado)


def descifrar():
    texto = entrada_texto.get("1.0", tk.END).rstrip("\n")
    clave = entrada_clave.get()

    if not clave.isdigit():
        messagebox.showerror("Error", "La clave debe ser numérica")
        return

    resultado = descifrar_cesar_ascii(texto, clave)

    salida.delete("1.0", tk.END)
    salida.insert(tk.END, resultado)


# -----------------------------
# Interfaz gráfica
# -----------------------------

ventana = tk.Tk()
ventana.title("Cifrado César ASCII con Clave Numérica")
ventana.geometry("600x500")

# Texto de entrada
tk.Label(ventana, text="Texto:").pack(anchor="w", padx=10, pady=5)
entrada_texto = tk.Text(ventana, height=8)
entrada_texto.pack(fill="both", padx=10)

# Clave
tk.Label(ventana, text="Clave numérica (ej: 9372):").pack(anchor="w", padx=10, pady=5)
entrada_clave = tk.Entry(ventana)
entrada_clave.pack(fill="x", padx=10)

# Botones
frame_botones = tk.Frame(ventana)
frame_botones.pack(pady=10)

tk.Button(frame_botones, text="Cifrar", width=15, command=cifrar).pack(side="left", padx=10)
tk.Button(frame_botones, text="Descifrar", width=15, command=descifrar).pack(side="left", padx=10)

# Texto de salida
tk.Label(ventana, text="Resultado:").pack(anchor="w", padx=10, pady=5)
salida = tk.Text(ventana, height=8)
salida.pack(fill="both", padx=10)

ventana.mainloop()
