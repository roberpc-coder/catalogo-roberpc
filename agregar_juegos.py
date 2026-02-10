import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import csv
import os
import re
from datetime import datetime

CSV_FILE = "games.csv"
PORTADAS_DIR = "portadas"
juego_en_edicion = None


def limpiar(texto):
    return texto.strip() if texto else ""


def formatear_tamaño(valor):
    valor = valor.strip()
    if not valor or not re.match(r"^\d+(\.\d+)?$", valor):
        return ""
    return f"{valor} Gb"


def generar_portada(nombre):
    nombre_limpio = re.sub(r"[^\w\s\-\.]", "", nombre.strip())[:100]
    return f"{PORTADAS_DIR}/{nombre_limpio}.webp"


def crear_backup():
    if not os.path.exists(CSV_FILE):
        return
    backup_file = f"games-backup-{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    with open(CSV_FILE, "r", encoding="utf-8") as src, open(
        backup_file, "w", encoding="utf-8"
    ) as dst:
        dst.write(src.read())


def limpiar_campos():
    entry_nombre.delete(0, tk.END)
    entry_tamaño.delete(0, tk.END)
    combo_plataforma.set("")
    entry_genero.delete(0, tk.END)
    text_requisitos.delete("1.0", tk.END)
    entry_año.delete(0, tk.END)
    var_estreno.set(False)
    modo_edicion.set("")
    global juego_en_edicion
    juego_en_edicion = None


def formatear_requisitos(texto):
    lineas = texto.strip().splitlines()
    lineas_con_viñeta = [f"•{linea.strip()}" for linea in lineas if linea.strip()]
    return "\n".join(lineas_con_viñeta)


def editar_juego():
    global juego_en_edicion

    nombre = limpiar(entry_nombre.get())
    plataforma = combo_plataforma.get()

    if not nombre or not plataforma:
        messagebox.showerror("Error", "Debes ingresar nombre y plataforma para editar.")
        return

    if not os.path.exists(CSV_FILE):
        messagebox.showinfo("Catálogo vacío", "No hay juegos registrados aún.")
        return

    with open(CSV_FILE, "r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        juegos = list(reader)

    juego_encontrado = None

    for j in juegos:
        if (
            limpiar(j["Nombre"]).lower() == nombre.lower()
            and limpiar(j["Plataforma"]).lower() == plataforma.lower()
        ):
            juego_encontrado = j
            break

    if not juego_encontrado:
        messagebox.showinfo("No encontrado", "❌ El juego no está en el catálogo.")
        return

    confirmar = messagebox.askyesno(
        "Editar juego", f"¿Querés editar '{nombre}' en plataforma '{plataforma}'?"
    )
    if not confirmar:
        return

    entry_nombre.delete(0, tk.END)
    entry_nombre.insert(0, juego_encontrado["Nombre"])

    tamaño_limpio = juego_encontrado["Tamaño"].replace("Gb", "").strip()
    entry_tamaño.delete(0, tk.END)
    entry_tamaño.insert(0, tamaño_limpio)

    combo_plataforma.set(juego_encontrado["Plataforma"])

    entry_genero.delete(0, tk.END)
    entry_genero.insert(0, juego_encontrado["Género"])

    text_requisitos.delete("1.0", tk.END)
    text_requisitos.insert(tk.END, juego_encontrado["Requisitos"])

    entry_año.delete(0, tk.END)
    entry_año.insert(0, juego_encontrado["Año"])

    var_estreno.set(juego_encontrado["Estreno"].lower() == "true")

    juego_en_edicion = juego_encontrado
    modo_edicion.set("🛠️ Modo edición activa")


def guardar_juego():
    global juego_en_edicion

    nombre = limpiar(entry_nombre.get())
    tamaño_valor = limpiar(entry_tamaño.get())
    tamaño = formatear_tamaño(tamaño_valor)
    plataforma = combo_plataforma.get()
    genero = limpiar(entry_genero.get())
    requisitos_raw = limpiar(text_requisitos.get("1.0", tk.END)).strip()
    requisitos = formatear_requisitos(requisitos_raw)
    año = limpiar(entry_año.get())
    estreno = "true" if var_estreno.get() else ""
    portada = generar_portada(nombre)

    if not nombre:
        messagebox.showerror("Error", "⚠️ El campo 'Nombre del juego' está vacío.")
        return

    if not tamaño_valor:
        messagebox.showerror("Error", "⚠️ El campo 'Tamaño' está vacío.")
        return
    if not re.match(r"^\d+(\.\d+)?$", tamaño_valor):
        messagebox.showerror(
            "Error",
            "⚠️ El tamaño debe ser un número válido (ej: 5 o 5.2). No uses letras ni símbolos.",
        )
        return

    if not plataforma:
        messagebox.showerror("Error", "⚠️ Debes seleccionar una plataforma.")
        return

    if not genero:
        continuar = messagebox.askyesno(
            "Género vacío",
            "⚠️ No ingresaste el género del juego.\n¿Querés continuar sin él?",
        )
        if not continuar:
            return

    if not año:
        continuar = messagebox.askyesno(
            "Año vacío",
            "⚠️ No ingresaste el año de lanzamiento.\n¿Querés continuar sin él?",
        )
        if not continuar:
            return
    elif not año.isdigit():
        messagebox.showerror("Error", "⚠️ El año debe ser un número (ej: 2023).")
        return
    elif len(año) != 4:
        messagebox.showerror("Error", "⚠️ El año debe tener 4 dígitos (ej: 2025).")
        return

    if not requisitos_raw:
        continuar = messagebox.askyesno(
            "Requisitos vacíos",
            "⚠️ No ingresaste requisitos.\n¿Querés continuar de todos modos?",
        )
        if not continuar:
            return

    nuevo_juego = {
        "Nombre": nombre,
        "Tamaño": tamaño,
        "Plataforma": plataforma,
        "Portada": portada,
        "Género": genero,
        "Requisitos": requisitos,
        "Año": año,
        "Estreno": estreno,
    }

    juegos = []
    juego_existente = False

    if os.path.exists(CSV_FILE):
        with open(CSV_FILE, "r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f)
            for j in reader:
                nombre_csv = limpiar(j["Nombre"]).lower()
                plataforma_csv = limpiar(j["Plataforma"]).lower()
                if (
                    nombre.lower() == nombre_csv
                    and plataforma.lower() == plataforma_csv
                ):
                    juego_existente = True
                juegos.append(j)

    if juego_existente and not modo_edicion.get():
        messagebox.showerror(
            "⚠️ Ya existe",
            f"El juego '{nombre}' en plataforma '{plataforma}' ya está en el catálogo.\nUsá el botón ✏️ Editar juego para modificarlo.",
        )
        return

    if modo_edicion.get() and juego_en_edicion:
        juegos = [
            j
            for j in juegos
            if not (
                limpiar(j["Nombre"]).lower()
                == limpiar(juego_en_edicion["Nombre"]).lower()
                and limpiar(j["Plataforma"]).lower()
                == limpiar(juego_en_edicion["Plataforma"]).lower()
            )
        ]
        modo_edicion.set("")
        juego_en_edicion = None

    if estreno == "true":
        estrenos_actuales = [j for j in juegos if j["Estreno"].lower() == "true"]
        if len(estrenos_actuales) >= 12:

            def seleccionar_reemplazo(callback):
                ventana = tk.Toplevel(root)
                ventana.title("🎬 Elegí qué estreno reemplazar")
                ventana.geometry("600x400")
                ventana.grab_set()

                tk.Label(
                    ventana,
                    text="Ya hay 12 estrenos. Elegí cuál querés quitar:",
                    font=("Arial", 12, "bold"),
                ).pack(pady=10)

                lista = tk.Listbox(ventana, font=("Arial", 11), height=12)
                lista.pack(fill="both", expand=True, padx=20)

                for j in estrenos_actuales:
                    lista.insert(tk.END, f"{j['Nombre']} ({j['Plataforma']})")

                def confirmar():
                    seleccion = lista.curselection()
                    if not seleccion:
                        messagebox.showerror(
                            "Error", "Seleccioná un juego para reemplazar."
                        )
                        return
                    index = seleccion[0]
                    juego_a_quitar = estrenos_actuales[index]
                    for j in juegos:
                        if (
                            j["Nombre"] == juego_a_quitar["Nombre"]
                            and j["Plataforma"] == juego_a_quitar["Plataforma"]
                        ):
                            j["Estreno"] = ""
                            messagebox.showinfo(
                                "🎬 Reemplazo hecho",
                                f"Se quitó el estreno a '{j['Nombre']}' para agregar el nuevo.",
                            )
                            ventana.destroy()
                            callback()
                            return

                tk.Button(
                    ventana,
                    text="Confirmar reemplazo",
                    command=confirmar,
                    font=("Arial", 11),
                ).pack(pady=10)

            seleccionar_reemplazo(lambda: agregar_juego_final(juegos, nuevo_juego))
            return

    agregar_juego_final(juegos, nuevo_juego)


def agregar_juego_final(juegos, nuevo_juego):
    juegos.append(nuevo_juego)
    juegos_ordenados = sorted(juegos, key=lambda x: x["Nombre"].lower())

    crear_backup()
    with open(CSV_FILE, "w", encoding="utf-8", newline="") as f:
        fieldnames = [
            "Nombre",
            "Tamaño",
            "Plataforma",
            "Portada",
            "Género",
            "Requisitos",
            "Año",
            "Estreno",
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_ALL)
        writer.writeheader()
        writer.writerows(juegos_ordenados)

    messagebox.showinfo("✅ Guardado", f"Juego agregado: {nuevo_juego['Nombre']}")
    limpiar_campos()


root = tk.Tk()
root.title("🎮 Agregar o Editar Juegos")
root.geometry("1050x520")
root.option_add("*Font", "Arial 12")
root.grid_columnconfigure(0, weight=1)
root.grid_columnconfigure(1, weight=1)

modo_edicion = tk.StringVar(value="")

tk.Label(root, text="📝 Nombre del juego:").grid(
    row=0, column=0, sticky="w", padx=10, pady=5
)
entry_nombre = tk.Entry(root, width=30)
entry_nombre.grid(row=0, column=1, sticky="w", padx=10)

tk.Label(root, text="💾 Tamaño (solo número, se agrega Gb):").grid(
    row=1, column=0, sticky="w", padx=10, pady=5
)
entry_tamaño = tk.Entry(root, width=30)
entry_tamaño.grid(row=1, column=1, sticky="w", padx=10)

tk.Label(root, text="🎯 Plataforma:").grid(row=2, column=0, sticky="w", padx=10, pady=5)
plataformas = [
    "PC",
    "PC Online",
    "Emulados en PC",
    "Nintendo Switch",
    "PS4",
    "PS5",
    "Xbox One",
    "Xbox Series X/S",
    "Activacion en pc",
]
combo_plataforma = ttk.Combobox(root, values=plataformas, width=28)
combo_plataforma.grid(row=2, column=1, sticky="w", padx=10)

tk.Label(root, text="🎭 Género:").grid(row=3, column=0, sticky="w", padx=10, pady=5)
entry_genero = tk.Entry(root, width=30)
entry_genero.grid(row=3, column=1, sticky="w", padx=10)

tk.Label(root, text="⚙️ Requisitos (pegá sin viñetas, se agregan solas):").grid(
    row=4, column=0, sticky="nw", padx=10, pady=5
)
text_requisitos = scrolledtext.ScrolledText(root, height=10, font=("Arial", 11))
text_requisitos.grid(row=4, column=1, columnspan=1, sticky="we", padx=10)

tk.Label(root, text="📅 Año:").grid(row=5, column=0, sticky="w", padx=10, pady=5)
entry_año = tk.Entry(root, width=10)
entry_año.grid(row=5, column=1, sticky="w", padx=10)

var_estreno = tk.BooleanVar()
check_estreno = tk.Checkbutton(root, text="🎬 ¿Es estreno?", variable=var_estreno)
check_estreno.grid(row=6, column=1, sticky="w", padx=10, pady=5)

label_modo = tk.Label(
    root, textvariable=modo_edicion, fg="red", font=("Arial", 12, "bold")
)
label_modo.grid(row=7, column=1, sticky="w", padx=10, pady=5)

# Botones centrados y expandiendo en toda la fila
frame_botones = tk.Frame(root)
frame_botones.grid(row=11, column=0, columnspan=2, pady=20, sticky="ew")
frame_botones.grid_columnconfigure(0, weight=1)
frame_botones.grid_columnconfigure(1, weight=1)
frame_botones.grid_columnconfigure(2, weight=1)

tk.Button(
    frame_botones, text="AGREGAR", command=guardar_juego, font=("Segoe UI", 11)
).grid(row=0, column=0, padx=5, sticky="ew")
tk.Button(
    frame_botones, text="EDITAR", command=editar_juego, font=("Segoe UI", 11)
).grid(row=0, column=1, padx=5, sticky="ew")
tk.Button(
    frame_botones, text="LIMPIAR", command=limpiar_campos, font=("Segoe UI", 11)
).grid(row=0, column=2, padx=5, sticky="ew")

# Pie de página
footer = tk.Label(root, text="Producido por Rober PC 2025", anchor="e", fg="gray")
footer.grid(row=99, column=1, sticky="e", padx=10, pady=(0, 10))

root.mainloop()
