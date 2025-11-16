function calcularPrecio(nombre, plataforma, tamaño) {
  nombre = nombre.trim();
  plataforma = plataforma.toLowerCase();
  let t = parseFloat((tamaño || "").toLowerCase().replace("gb", "").trim());

  const preciosEspeciales = {
    "EA SPORTS FC 26": 3000,
    "Battlefield 3 Zolemu": 250,
    "Battlefield 4 Zolemu": 250,
    "World of Warcraft Cataclysm": 150,
    "World of Warcraft Wrath of the Lich King": 150,
    "World of Warcraft Pandaria": 200,
    "Among Us": 100,
    "World of Warcraft Legion": 250,
  };
  if (preciosEspeciales[nombre]) return preciosEspeciales[nombre];

  if (plataforma.includes("nintendo switch")) return 100;
  if (plataforma.includes("pc online")) return 500;
  if (plataforma.includes("emulados en pc")) return 100;

  if (!isNaN(t)) {
    if (t <= 4.9) return 50;
    if (t <= 14.9) return 60;
    if (t <= 39.9) return 70;
    if (t <= 69.9) return 90;
    if (t <= 99.9) return 100;
    if (t >= 100) return 200;
  }
  return "N/D";
}
