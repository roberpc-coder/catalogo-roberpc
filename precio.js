function calcularPrecio(nombre, plataforma, tamaño) {
  nombre = nombre.trim();
  plataforma = plataforma.toLowerCase();
  let t = parseFloat((tamaño || "").toLowerCase().replace("gb", "").trim());

  const preciosEspeciales = {
    "Ea Sports Fc 26": 3000,
    "Battlefield 3 Zolemu": 250,
    "Battlefield 4 Zolemu": 250,
    "World Of Warcraft Cataclysm": 150,
    "World Of Warcraft Wrath Of The Lich King": 250,
    "World Of Warcraft Mists Of Pandaria": 200,
    "Among Us": 100,
    "World Of Warcraft Legion": 250,
    "Albion Online": 150,
    Dayz: 250,
    "Polygon Storm": 150,
    "Starcraft Remastered": 250,
    "Persona 3 Reload Demo Unlocker": 250,
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
