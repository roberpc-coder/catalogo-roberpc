function calcularPrecio(nombre, plataforma, tamaño) {
  nombre = nombre.trim();
  plataforma = plataforma.toLowerCase();
  let t = parseFloat((tamaño || "").toLowerCase().replace("gb", "").trim());

  const preciosEspeciales = {
    "Battlefield 3 Zolemu": 250,
    "Battlefield 4 Zolemu": 250,
    "World Of Warcraft Cataclysm": 150,
    "World Of Warcraft Wrath Of The Lich King": 250,
    "World Of Warcraft Mists Of Pandaria": 200,
    "Among Us": 100,
    "World Of Warcraft Legion": 250,
    "Albion Online": 250,
    "Polygon Storm": 250,
    "Starcraft Remastered": 250,
    "2KCuba25": 250,
    "Rust Pirata Ruso": 500,
    "World Of Warcraft Dragon Flight": 500,
    "World Of Warcraft The War Within": 500,
    Bloodstrike: 500,
  };
  if (preciosEspeciales[nombre]) return preciosEspeciales[nombre];

  if (plataforma.includes("nintendo switch")) return 100;
  if (plataforma.includes("pc online")) return 1000;
  if (plataforma.includes("emulados en pc")) return 100;
  if (plataforma.includes("activacion en pc")) return 3000;

  if (!isNaN(t)) {
    if (t <= 4.9) return 50;
    if (t <= 14.9) return 80;
    if (t <= 39.9) return 100;
    if (t <= 69.9) return 120;
    if (t <= 99.9) return 150;
    if (t >= 100) return 200;
  }
  return "N/D";
}
