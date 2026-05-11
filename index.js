document.addEventListener("DOMContentLoaded", function () {
  // --- VARIABLES DE ESTADO ---
  let gamesData = [];
  let filteredData = [];
  let currentIndex = 0;
  const itemsPerPage = 12;
  let isLoading = false;

  const catalogContainer = document.getElementById("gameCatalog");
  const searchInput = document.getElementById("searchInput");
  const platformSelect = document.getElementById("platformSelect");

  // --- 1. CARGA INICIAL ---
  fetch("games.json")
    .then((response) => {
      if (!response.ok) throw new Error("No se pudo cargar el JSON");
      return response.json();
    })
    .then((data) => {
      gamesData = data;
      filteredData = [...gamesData];

      const savedFilter = localStorage.getItem("filtroPlataforma");
      if (savedFilter) {
        platformSelect.value = savedFilter;
        applyFilters();
      } else {
        renderNextBatch(true);
      }

      updateCartCount();
      initScrollListener();
    })
    .catch((error) => {
      catalogContainer.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    });

  // --- 2. RENDERIZADO POR LOTES (OPTIMIZADO) ---
  function renderNextBatch(reset = false) {
    if (reset) {
      catalogContainer.innerHTML = "";
      currentIndex = 0;
      window.scrollTo(0, 0);
    }

    const fragment = document.createDocumentFragment();
    const nextBatch = filteredData.slice(
      currentIndex,
      currentIndex + itemsPerPage,
    );

    if (nextBatch.length === 0 && currentIndex === 0) {
      catalogContainer.innerHTML =
        '<div class="error">No se encontraron resultados.</div>';
      isLoading = false;
      return;
    }

    nextBatch.forEach((game) => {
      const card = document.createElement("div");
      card.className = "game-card";
      // Añadimos una altura mínima para que el scroll no "salte" antes de cargar la foto
      card.style.minHeight = "320px";

      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const isInCart = cart.some((item) => item.id === game.id);

      card.innerHTML = `
        <img src="portadas/${game.img}" alt="${game.n}" class="game-cover" loading="lazy"
             onclick="window.location.href='detalles.html?id=${game.id}'"
             onerror="this.src='imagenes/placeholder.jpg'">
        <div class="game-info" style="text-align: center; padding: 10px 5px;">
          <h3 class="game-title" style="margin: 4px 0; font-size: 0.95rem; line-height: 1.2; height: 2.4em; overflow: hidden;">${game.n}</h3>
          <div class="game-meta" style="margin-bottom: 10px; font-size: 0.85rem; display: flex; justify-content: center; gap: 8px;">
            <span style="color: #4caf50; font-weight: bold;">📦 ${game.t}</span>
            <span style="color: #ff4444; font-weight: bold;">💰 ${game.pr} Cup</span>
          </div>
          <div class="btn-group" style="display: flex; gap: 5px; width: 100%;">
            <button class="details-btn" style="flex: 1; padding: 8px 2px; font-size: 0.8rem; background-color: #ff4444; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;"
                    onclick="verTrailer('${game.n.replace(/'/g, "\\'")}')">Trailer</button>

            <button class="add-cart-btn" style="flex: 1; padding: 8px 2px; font-size: 0.8rem; background-color: #4caf50; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;"
                    data-id="${game.id}"
                    ${isInCart ? 'disabled style="background-color:#555; flex: 1; padding: 8px 2px; cursor: default;"' : ""}>
              ${isInCart ? "Ya pedido" : "Pedir"}
            </button>
          </div>
        </div>
      `;
      fragment.appendChild(card);
    });

    catalogContainer.appendChild(fragment);
    currentIndex += nextBatch.length;

    // Pausa de seguridad para que el navegador asimile el nuevo contenido
    setTimeout(() => {
      isLoading = false;
    }, 300);
  }

  // --- 3. DETECTOR DE SCROLL REFORZADO ---
  function initScrollListener() {
    window.addEventListener(
      "scroll",
      () => {
        if (isLoading || currentIndex >= filteredData.length) return;

        const scrollPos = window.innerHeight + window.scrollY;
        // Umbral reducido a 100px para que no cargue antes de tiempo
        const threshold = document.documentElement.scrollHeight - 100;

        if (scrollPos >= threshold) {
          isLoading = true;
          renderNextBatch();
        }
      },
      { passive: true },
    );
  }

  // --- 4. FILTRADO ---
  function applyFilters() {
    const term = searchInput.value.toLowerCase();
    const plat = platformSelect.value;

    filteredData = gamesData.filter((game) => {
      const matchesSearch = game.n.toLowerCase().includes(term);
      const matchesPlatform = plat === "all" || game.p === plat;
      return matchesSearch && matchesPlatform;
    });

    renderNextBatch(true);
  }

  searchInput.addEventListener("input", applyFilters);
  platformSelect.addEventListener("change", () => {
    localStorage.setItem("filtroPlataforma", platformSelect.value);
    applyFilters();
  });

  // --- 5. CARRITO ---
  catalogContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-cart-btn")) {
      const gameId = e.target.dataset.id;
      const game = gamesData.find((g) => g.id === gameId);
      if (game) addToCart(game, e.target);
    }
  });

  function addToCart(game, button) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (!cart.some((item) => item.id === game.id)) {
      cart.push({ id: game.id, n: game.n, p: game.p, t: game.t, pr: game.pr });
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));
      updateCartCount();

      button.textContent = "Ya pedido";
      button.style.backgroundColor = "#555";
      button.disabled = true;
      button.style.cursor = "default";
    }
  }

  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const countSpan = document.querySelector(".cart-count");
    if (countSpan) countSpan.textContent = cart.length;

    const buttons = document.querySelectorAll(".add-cart-btn");
    buttons.forEach((btn) => {
      const id = btn.dataset.id;
      const exists = cart.some((item) => item.id === id);
      if (!exists && btn.disabled) {
        btn.textContent = "Pedir";
        btn.disabled = false;
        btn.style.backgroundColor = "#4caf50";
        btn.style.cursor = "pointer";
      }
    });
  }

  window.addEventListener("storage", updateCartCount);

  window.verTrailer = function (nombreJuego) {
    const busqueda = encodeURIComponent(nombreJuego + " trailer oficial");
    window.open(
      `https://www.youtube.com/results?search_query=${busqueda}`,
      "_blank",
    );
  };

  // Sincronización para celulares (Back-Forward Cache)
  window.addEventListener("pageshow", updateCartCount);
});
