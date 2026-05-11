document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const gameId = params.get("id");
  const detailsContainer = document.getElementById("gameDetails");

  // --- FUNCIÓN: ACTUALIZAR CONTADOR Y BOTÓN ---
  function updateUI() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    // 1. Actualizar el numerito del contador (si existe en el header de esta página)
    const countSpan = document.querySelector(".cart-count");
    if (countSpan) countSpan.textContent = cart.length;

    // 2. Actualizar el estado del botón de pedir
    const addBtn = document.getElementById("addToCartBtn");
    if (addBtn && gameId) {
      const isInCart = cart.some((item) => item.id === gameId);
      if (isInCart) {
        addBtn.textContent = "Ya pedido";
        addBtn.disabled = true;
        addBtn.style.backgroundColor = "#555";
        addBtn.style.cursor = "default";
      } else {
        addBtn.textContent = "Pedir";
        addBtn.disabled = false;
        addBtn.style.backgroundColor = "#4caf50";
        addBtn.style.cursor = "pointer";
      }
    }
  }

  // --- FUNCIÓN: VER TRAILER ---
  window.verTrailer = function (nombreJuego) {
    const busqueda = encodeURIComponent(nombreJuego + " trailer oficial");
    window.open(
      `https://www.youtube.com/results?search_query=${busqueda}`,
      "_blank",
    );
  };

  if (!gameId) {
    detailsContainer.innerHTML = "<p class='error'>Juego no encontrado.</p>";
    return;
  }

  fetch("games.json")
    .then((response) => {
      if (!response.ok)
        throw new Error("No se pudo cargar el archivo de datos");
      return response.json();
    })
    .then((gamesData) => {
      const game = gamesData.find((g) => g.id === gameId);

      if (!game) {
        detailsContainer.innerHTML =
          "<p class='error'>Juego no encontrado.</p>";
        return;
      }

      const coverPath = `portadas/${game.img}`;

      detailsContainer.innerHTML = `
        <div class="details-container">
          <div class="details-header">
            <div class="details-cover-wrapper">
              <img src="${coverPath}" alt="${game.n}" class="details-cover"
                   onerror="this.src='imagenes/placeholder.jpg'">
            </div>

            <div class="details-info">
              <h2 class="details-title">${game.n}</h2>
              <div class="details-meta">
                <div class="meta-item">
                  <div class="meta-label">Plataforma</div>
                  <div class="meta-value">${game.p || "N/D"}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Año</div>
                  <div class="meta-value">${game.a || "N/D"}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Género</div>
                  <div class="meta-value">${game.g || "N/D"}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Tamaño</div>
                  <div class="meta-value">${game.t || "N/D"}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Precio</div>
                  <div class="meta-value">${game.pr} Cup</div>
                </div>
              </div>

              <div class="btn-group" style="margin-top: 25px; display: flex; gap: 10px; flex-wrap: wrap;">
                <button onclick="verTrailer('${game.n.replace(/'/g, "\\'")}')" class="details-btn" style="background-color: #ff4444; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer;">
                    Trailer
                </button>
                <button id="addToCartBtn" class="add-cart-btn" style="background-color: #4caf50; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer;">
                    Pedir
                </button>
              </div>
            </div>
          </div>

          <div class="details-description">
            <h2>Requisitos del Sistema</h2>
            <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; font-family: sans-serif; color: #ffffff; line-height: 1.8; border: 1px solid #333; font-size: 0.95rem;">
                ${
                  game.r
                    ? game.r
                        .split("•")
                        .filter((t) => t.trim())
                        .map((t) => {
                          const parte = t
                            .trim()
                            .replace(
                              /^([^:]+:)/,
                              '<strong style="color: #4caf50;">$1</strong>',
                            );
                          return `• ${parte}`;
                        })
                        .join("<br>")
                    : "No especificados."
                }
            </div>
          </div>
        </div>
      `;

      // Inicializar el estado de los botones y contador apenas cargue la info
      updateUI();

      const addBtn = document.getElementById("addToCartBtn");
      addBtn.addEventListener("click", () => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        if (!cart.some((item) => item.id === game.id)) {
          cart.push({
            id: game.id,
            n: game.n,
            p: game.p,
            t: game.t,
            pr: game.pr,
          });

          localStorage.setItem("cart", JSON.stringify(cart));

          // Avisar a las otras pestañas
          window.dispatchEvent(new Event("storage"));

          // Actualizar esta misma página inmediatamente
          updateUI();
        }
      });
    })
    .catch((error) => {
      detailsContainer.innerHTML = `<p class="error">Error al cargar detalles: ${error.message}</p>`;
    });

  // --- SINCRONIZACIÓN EN TIEMPO REAL ---
  window.addEventListener("storage", updateUI);
});
