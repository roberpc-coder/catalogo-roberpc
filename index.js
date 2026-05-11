document.addEventListener("DOMContentLoaded", function () {
  // --- 1. VARIABLES ---
  let gamesData = [];
  let filteredData = [];
  let currentIndex = 0;
  const itemsPerPage = 12;
  let isLoading = false;

  const catalogContainer = document.getElementById("gameCatalog");
  const searchInput = document.getElementById("searchInput");
  const platformSelect = document.getElementById("platformSelect");

  // --- 2. CARGA INICIAL ---
  fetch("games.json")
    .then((res) => res.json())
    .then((data) => {
      gamesData = data;
      filteredData = [...gamesData];

      const savedFilter = localStorage.getItem("filtroPlataforma");
      if (savedFilter) {
        platformSelect.value = savedFilter;
      }

      applyFilters();
      setupScrollListener();
    })
    .catch((err) => console.error("Error ROBER PC:", err));

  // --- 3. RENDERIZADO ---
  function renderNextBatch(reset = false) {
    if (reset) {
      catalogContainer.innerHTML = "";
      currentIndex = 0;
      window.scrollTo(0, 0);
    }

    const nextBatch = filteredData.slice(
      currentIndex,
      currentIndex + itemsPerPage,
    );
    if (nextBatch.length === 0) return;

    const fragment = document.createDocumentFragment();
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    nextBatch.forEach((game) => {
      const isInCart = cart.some((item) => item.id === game.id);
      const card = document.createElement("div");
      card.className = "game-card";
      card.style.minHeight = "350px";
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
            <button class="add-cart-btn" data-id="${game.id}"
                    style="flex: 1; padding: 8px 2px; font-size: 0.8rem; background-color: ${isInCart ? "#555" : "#4caf50"}; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: ${isInCart ? "default" : "pointer"};"
                    ${isInCart ? "disabled" : ""}>
              ${isInCart ? "Ya pedido" : "Pedir"}
            </button>
          </div>
        </div>
      `;
      fragment.appendChild(card);
    });

    catalogContainer.appendChild(fragment);
    currentIndex += nextBatch.length;

    const loader =
      document.getElementById("loadingIndicator") || createLoader();
    catalogContainer.appendChild(loader);
  }

  // --- 4. SCROLL CASERO ---
  function setupScrollListener() {
    window.onscroll = function () {
      if (isLoading) return;
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 800
      ) {
        if (currentIndex < filteredData.length) {
          isLoading = true;
          const loader = document.getElementById("loadingIndicator");
          if (loader) loader.style.opacity = "1";

          setTimeout(() => {
            renderNextBatch();
            if (loader) loader.style.opacity = "0";
            isLoading = false;
          }, 300);
        }
      }
    };
  }

  // --- 5. FILTRADO (ARREGLO PARA QUE NO SE MAREE) ---
  function applyFilters() {
    const term = (searchInput.value || "").toLowerCase().trim();
    const plat = platformSelect.value;

    filteredData = gamesData.filter((game) => {
      const matchSearch = game.n.toLowerCase().includes(term);
      const matchPlat = plat === "all" || game.p === plat;
      return matchSearch && matchPlat;
    });

    renderNextBatch(true);

    // CARGA EXTRA: Si hay juegos y la página es corta, carga 12 más
    // para que el scroll casero tenga espacio para funcionar.
    if (
      filteredData.length > currentIndex &&
      document.body.offsetHeight <= window.innerHeight + 200
    ) {
      renderNextBatch();
    }
    updateCartCount();
  }

  function createLoader() {
    const loader = document.createElement("div");
    loader.id = "loadingIndicator";
    loader.style.cssText =
      "text-align:center; padding:20px; color:#4caf50; font-weight:bold; width:100%; opacity:0; transition:opacity 0.3s;";
    loader.innerHTML = "Cargando más estrenos...";
    return loader;
  }

  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const countSpan = document.querySelector(".cart-count");
    if (countSpan) countSpan.textContent = cart.length;

    document.querySelectorAll(".add-cart-btn").forEach((btn) => {
      const exists = cart.some((item) => item.id === btn.dataset.id);
      btn.textContent = exists ? "Ya pedido" : "Pedir";
      btn.disabled = exists;
      btn.style.backgroundColor = exists ? "#555" : "#4caf50";
      btn.style.cursor = exists ? "default" : "pointer";
    });
  }

  // --- EVENTOS ---
  searchInput.addEventListener("input", applyFilters);
  platformSelect.addEventListener("change", () => {
    localStorage.setItem("filtroPlataforma", platformSelect.value);
    applyFilters();
  });

  catalogContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-cart-btn")) {
      const gameId = e.target.dataset.id;
      const game = gamesData.find((g) => g.id === gameId);
      if (game) {
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
          window.dispatchEvent(new Event("storage"));
          updateCartCount();
        }
      }
    }
  });

  window.addEventListener("storage", updateCartCount);
  window.addEventListener("pageshow", updateCartCount);
  window.verTrailer = (n) =>
    window.open(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(n + " trailer oficial")}`,
      "_blank",
    );
});
