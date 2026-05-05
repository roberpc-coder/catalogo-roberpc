document.addEventListener("DOMContentLoaded", function () {
  let estrenosData = [];
  const catalogContainer = document.getElementById("gameCatalog");

  catalogContainer.innerHTML =
    '<div class="loading">Cargando estrenos de ROBER® PC...</div>';

  fetch("games.json")
    .then((response) => {
      if (!response.ok) throw new Error("No se pudo cargar el catálogo");
      return response.json();
    })
    .then((data) => {
      estrenosData = data.filter(
        (game) => game.e === "true" || game.e === "True" || game.e === true,
      );

      if (estrenosData.length > 12) {
        estrenosData = estrenosData.slice(0, 12);
      }

      renderEstrenos();
      updateCartCount();
    })
    .catch((error) => {
      catalogContainer.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    });

  function renderEstrenos() {
    if (estrenosData.length === 0) {
      catalogContainer.innerHTML =
        '<div class="error">No hay estrenos disponibles.</div>';
      return;
    }

    catalogContainer.innerHTML = "";
    const fragment = document.createDocumentFragment();

    estrenosData.forEach((game) => {
      const card = document.createElement("div");
      card.className = "game-card";

      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const isInCart = cart.some((item) => item.id === game.id);

      // DISEÑO CORREGIDO: Colores diferentes y botones equilibrados
      card.innerHTML = `
        <img src="portadas/${game.img}" alt="${game.n}" class="game-cover" loading="lazy"
             onclick="window.location.href='detalles.html?id=${game.id}'"
             onerror="this.src='imagenes/placeholder.jpg'">
        <div class="game-info" style="text-align: center; padding: 10px 5px;">
            <h3 class="game-title" style="margin: 4px 0; font-size: 0.95rem; line-height: 1.2; height: 2.4em; overflow: hidden;">${game.n}</h3>
            <p class="game-meta" style="margin-bottom: 10px; font-size: 0.85rem; display: flex; justify-content: center; gap: 8px;">
                <span style="color: #4caf50; font-weight: bold;">📦 ${game.t}</span>
                <span style="color: #ff4444; font-weight: bold;">💰 ${game.pr} Cup</span>
            </p>
            <div class="btn-group" style="display: flex; gap: 5px; width: 100%;">
                <!-- TRAILER EN ROJO -->
                <button class="details-btn" style="flex: 1; padding: 8px 2px; font-size: 0.8rem; background-color: #ff4444; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;"
                        onclick="verTrailer('${game.n.replace(/'/g, "\\'")}')">Trailer</button>

                <!-- CARRITO EN AZUL OSCURO/GRIS PARA DIFERENCIAR -->
                <button class="add-cart-btn" style="flex: 1; padding: 8px 2px; font-size: 0.8rem; background-color: #4caf50; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;"
                    data-id="${game.id}"
                    ${isInCart ? 'disabled style="background-color:#555; flex: 1; padding: 8px 2px;"' : ""}>
                    ${isInCart ? "En carrito" : "Comprar"}
                </button>
            </div>
        </div>`;
      fragment.appendChild(card);
    });

    catalogContainer.appendChild(fragment);
  }

  window.verTrailer = function (nombreJuego) {
    const busqueda = encodeURIComponent(nombreJuego + " trailer oficial");
    window.open(
      `https://www.youtube.com/results?search_query=${busqueda}`,
      "_blank",
    );
  };

  catalogContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-cart-btn")) {
      const gameId = e.target.getAttribute("data-id");
      const game = estrenosData.find((j) => j.id === gameId);
      if (game) addToCart(game, e.target);
    }
  });

  function addToCart(game, button) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (!cart.some((j) => j.id === game.id)) {
      cart.push({ id: game.id, n: game.n, p: game.p, t: game.t, pr: game.pr });
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount();

      button.textContent = "En carrito";
      button.style.backgroundColor = "#555";
      button.disabled = true;
    }
  }

  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const countSpan = document.querySelector(".cart-count");
    if (countSpan) countSpan.textContent = cart.length;
  }
});
