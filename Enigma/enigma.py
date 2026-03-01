import tkinter as tk
import string
from typing import List

# Edison David Alvarez Varela - 20222020043
# Miguel Angel Pedroza Vanegas - 20222020062
# Mauricio Sánchez Aguilar - 20212020045
# Johan Camilo Gomez Blanco - 20222020069

ALFABETO = string.ascii_uppercase

# =============================
# ROTORES HISTÓRICOS
# =============================
ROTORES = [
    "EKMFLGDQVZNTOWYHXUSPAIBRCJ",  # I
    "AJDKSIRUXBLHWTMCQGZNPYFVOE",  # II
    "BDFHJLCPRTXVZNYEIWGAKMUSQO"   # III
]

REFLECTOR = "YRUHQSLDPXNGOKMIEBFZCWVJAT"


# =============================
# CIFRAR UNA LETRA (ENIGMA REAL)
# =============================
def cifrar_letra(letra: str, posiciones: List[int]) -> str:

    if letra not in ALFABETO:
        return letra

    # --- GIRO ---
    posiciones[2] = (posiciones[2] + 1) % 26
    if posiciones[2] == 0:
        posiciones[1] = (posiciones[1] + 1) % 26
        if posiciones[1] == 0:
            posiciones[0] = (posiciones[0] + 1) % 26

    idx = ALFABETO.index(letra)

    # --- IDA ---
    for i in range(3):
        rotor = ROTORES[2 - i]  # derecho → izquierdo
        idx = (idx + posiciones[2 - i]) % 26
        idx = ALFABETO.index(rotor[idx])

    # --- REFLECTOR ---
    idx = ALFABETO.index(REFLECTOR[idx])

    # --- VUELTA ---
    for i in range(3):
        rotor = ROTORES[i]  # izquierdo → derecho
        idx = rotor.index(ALFABETO[idx])
        idx = (idx - posiciones[i]) % 26

    return ALFABETO[idx]


# =============================
# CIFRAR MENSAJE
# =============================
def cifrar_mensaje(texto: str, clave: int) -> str:

    clave_str = str(clave).zfill(4)

    # POSICIONES INICIALES DESDE CLAVE
    posiciones = [
        int(clave_str[0]) % 26,
        int(clave_str[1]) % 26,
        int(clave_str[2]) % 26
    ]

    resultado = ""

    for letra in texto.upper():
        resultado += cifrar_letra(letra, posiciones)

    return resultado


# =============================
# GUI
# =============================
def ejecutar():
    texto = entrada_texto.get()
    clave = entrada_clave.get()

    if not clave.isdigit():
        salida.config(text="Clave inválida")
        return

    resultado = cifrar_mensaje(texto, int(clave))
    salida.config(text="Resultado: " + resultado)


ventana = tk.Tk()
ventana.title("Simulación Enigma")
ventana.geometry("480x300")

tk.Label(ventana, text="Texto:", font=("Arial", 12)).pack(pady=5)
entrada_texto = tk.Entry(ventana, width=40)
entrada_texto.pack()

tk.Label(ventana, text="Clave pública:", font=("Arial", 12)).pack(pady=10)
entrada_clave = tk.Entry(ventana, width=20)
entrada_clave.pack()

tk.Button(ventana, text="Cifrar / Descifrar", command=ejecutar).pack(pady=15)

salida = tk.Label(ventana, text="", font=("Arial", 14))
salida.pack(pady=20)

ventana.mainloop()