document.addEventListener("DOMContentLoaded", function () {
  let gamesData = [];
  let filteredData = [];
  let currentIndex = 0;
  const itemsPerPage = 12;
  let isLoading = false;
  let observer;

  // 1. DEFINIR EL SONIDO (Asegúrate de que el archivo existe en esa ruta)
  const cashSound = new Audio("sonidos/money.mp3");

  const catalogContainer = document.getElementById("gameCatalog");
  const searchInput = document.getElementById("searchInput");
  const platformSelect = document.getElementById("platformSelect");

  fetch("games.json")
    .then((res) => res.json())
    .then((data) => {
      gamesData = data;
      filteredData = [...gamesData];
      const savedFilter = localStorage.getItem("filtroPlataforma");
      if (savedFilter) platformSelect.value = savedFilter;
      applyFilters();
    })
    .catch((err) => console.error("Error ROBER PC:", err));

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
    if (nextBatch.length === 0) {
      if (currentIndex === 0)
        catalogContainer.innerHTML =
          '<div style="color:white;text-align:center;padding:20px;">No hay resultados</div>';
      return;
    }

    const fragment = document.createDocumentFragment();
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    nextBatch.forEach((game) => {
      const isInCart = cart.some((item) => item.id === game.id);
      const card = document.createElement("div");
      card.className = "game-card";

      // CORRECCIÓN DE COMILLAS: Definimos el estilo dinámico aquí
      const btnColor = isInCart ? "#555" : "#4caf50";
      const btnCursor = isInCart ? "default" : "pointer";

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
                <button class="details-btn" style="flex: 1; padding: 8px 2px; font-size: 0.8rem; background-color: #ff4444; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;"
                        onclick="verTrailer('${game.n.replace(/'/g, "\\'")}')">Trailer</button>

                <button class="add-cart-btn"
                    data-id="${game.id}"
                    ${isInCart ? "disabled" : ""}
                    style="flex: 1; padding: 8px 2px; font-size: 0.8rem; background-color: ${btnColor}; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: ${btnCursor};">
                    ${isInCart ? "Ya pedido" : "Pedir"}
                </button>
            </div>
        </div>`;
      fragment.appendChild(card);
    });

    catalogContainer.appendChild(fragment);
    currentIndex += nextBatch.length;
    setupScrollListener();
  }

  function setupScrollListener() {
    const oldLoader = document.getElementById("loadingIndicator");
    if (oldLoader) oldLoader.remove();
    const loader = document.createElement("div");
    loader.id = "loadingIndicator";
    loader.style.cssText =
      "text-align:center; padding:20px; color:#4caf50; font-weight:bold; width:100%; opacity:0;";
    loader.innerHTML = "Cargando más...";
    catalogContainer.appendChild(loader);

    if (observer) observer.disconnect();
    observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          currentIndex < filteredData.length
        ) {
          isLoading = true;
          loader.style.opacity = "1";
          setTimeout(() => {
            renderNextBatch();
            isLoading = false;
          }, 150);
        }
      },
      { rootMargin: "600px" },
    );
    observer.observe(loader);
  }

  function applyFilters() {
    const term = (searchInput.value || "").toLowerCase().trim();
    const plat = platformSelect.value;
    filteredData = gamesData.filter((game) => {
      return (
        game.n.toLowerCase().includes(term) &&
        (plat === "all" || game.p === plat)
      );
    });
    renderNextBatch(true);
    updateCartCount();
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
          // 2. ACTIVAR SONIDO AQUÍ
          cashSound.currentTime = 0;
          cashSound.play().catch(() => {});

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
