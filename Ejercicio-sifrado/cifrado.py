import tkinter as tk
from tkinter import messagebox, simpledialog

def cifrar_mensaje(texto, desplazamiento):
    resultado = ""
    for char in texto:
        # No cifrar saltos de línea para mantener el formato
        if char == '\n' or char == '\r':
            resultado += char
        else:
            nuevo_char = chr((ord(char) + desplazamiento) % 256)
            resultado += nuevo_char
    return resultado

def descifrar_mensaje(texto, desplazamiento):
    return cifrar_mensaje(texto, -desplazamiento)

def on_cifrar():
    mensaje = text_entrada.get("1.0", tk.END).strip()
    if not mensaje:
        messagebox.showwarning("Advertencia", "Por favor ingrese un mensaje para cifrar.")
        return

    desplazamiento = simpledialog.askinteger("Desplazamiento", "Ingrese el corrimiento (entero):")
    
    if desplazamiento is not None:
        mensaje_cifrado = cifrar_mensaje(mensaje, desplazamiento)
        text_salida.delete("1.0", tk.END)
        text_salida.insert(tk.END, mensaje_cifrado)

def on_descifrar():
    mensaje = text_salida.get("1.0", tk.END).strip()
    # Si el campo de salida está vacío, intentar descifrar lo que hay en la entrada
    if not mensaje:
         mensaje = text_entrada.get("1.0", tk.END).strip()
         if not mensaje:
            messagebox.showwarning("Advertencia", "Por favor ingrese un mensaje para descifrar.")
            return

    desplazamiento = simpledialog.askinteger("Desplazamiento", "Ingrese el corrimiento (entero):")
    
    if desplazamiento is not None:
        mensaje_descifrado = descifrar_mensaje(mensaje, desplazamiento)
        text_entrada.delete("1.0", tk.END)
        text_entrada.insert(tk.END, mensaje_descifrado)

root = tk.Tk()
root.title("Cifrado César ASCII")
root.geometry("600x400")

main_frame = tk.Frame(root, padx=10, pady=10)
main_frame.pack(expand=True, fill=tk.BOTH)

main_frame.columnconfigure(0, weight=1)
main_frame.columnconfigure(1, weight=0)
main_frame.columnconfigure(2, weight=1)
main_frame.rowconfigure(1, weight=1)

tk.Label(main_frame, text="Mensaje Original").grid(row=0, column=0, sticky="w")
tk.Label(main_frame, text="Mensaje Cifrado").grid(row=0, column=2, sticky="w")

text_entrada = tk.Text(main_frame, height=15, width=25)
text_entrada.grid(row=1, column=0, sticky="nsew", padx=5)

text_salida = tk.Text(main_frame, height=15, width=25)
text_salida.grid(row=1, column=2, sticky="nsew", padx=5)

button_frame = tk.Frame(main_frame)
button_frame.grid(row=1, column=1, padx=5)

btn_cifrar = tk.Button(button_frame, text="Cifrar ->", command=on_cifrar)
btn_cifrar.pack(pady=10)

btn_descifrar = tk.Button(button_frame, text="<- Descifrar", command=on_descifrar)
btn_descifrar.pack(pady=10)

root.mainloop()
