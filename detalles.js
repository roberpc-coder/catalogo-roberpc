document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const gameId = params.get("id");
  const detailsContainer = document.getElementById("gameDetails");

  if (!gameId) {
    detailsContainer.innerHTML = "<p class='error'>Juego no encontrado.</p>";
    return;
  }

  Papa.parse("games.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      const gamesData = results.data.map((game, index) => ({
        ...game,
        id: index.toString(),
      }));
      const game = gamesData.find((g) => g.id === gameId);

      if (!game) {
        detailsContainer.innerHTML =
          "<p class='error'>Juego no encontrado.</p>";
        return;
      }

      const precio = calcularPrecio(game.Nombre, game.Plataforma, game.Tamaño);
      const coverPath =
        game.Portada && game.Portada.trim() !== ""
          ? game.Portada
          : "imagenes/placeholder.jpg";

      detailsContainer.innerHTML = `
        <div class="details-container">
          <div class="details-header">
            <img src="${coverPath}" alt="${game.Nombre}" class="details-cover"
                 onerror="this.src='imagenes/placeholder.jpg'">
            <div class="details-info">
              <h2 class="details-title">${game.Nombre}</h2>
              <div class="details-meta">
                <div class="meta-item">
                  <div class="meta-label">Plataforma</div>
                  <div class="meta-value">${game.Plataforma || "N/D"}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Año</div>
                  <div class="meta-value">${game.Año || "N/D"}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Género</div>
                  <div class="meta-value">${game.Género || "N/D"}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Tamaño</div>
                  <div class="meta-value">${game.Tamaño || "N/D"}</div>
                </div>
                <div class="meta-item">
                  <div class="meta-label">Precio</div>
                  <div class="meta-value">${precio} Cup</div>
                </div>
              </div>
              <div class="btn-group">
                <button id="addToCartBtn" class="add-cart-btn">Comprar</button>
              </div>
            </div>
          </div>
          <div class="details-description">
            <h2>Requisitos mínimos</h2>
            <p>${game.Requisitos || "No especificados."}</p>
          </div>
        </div>
      `;

      const addBtn = document.getElementById("addToCartBtn");
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const isInCart = cart.some((item) => item.id === game.id);

      if (isInCart) {
        addBtn.textContent = "En carrito";
        addBtn.disabled = true;
        addBtn.style.backgroundColor = "#777";
      }

      addBtn.addEventListener("click", () => {
        cart = JSON.parse(localStorage.getItem("cart")) || [];
        if (!cart.some((item) => item.id === game.id)) {
          cart.push({
            Plataforma: game.Plataforma,
            id: game.id,
            Nombre: game.Nombre,
            Tamaño: game.Tamaño,
            Precio: calcularPrecio(game.Nombre, game.Plataforma, game.Tamaño),
          });

          localStorage.setItem("cart", JSON.stringify(cart));
          window.dispatchEvent(new Event("storage"));
          addBtn.textContent = "En carrito";
          addBtn.disabled = true;
          addBtn.style.backgroundColor = "#777";
        }
      });
    },
    error: function (error) {
      detailsContainer.innerHTML = `<p class="error">Error al cargar detalles: ${error.message}</p>`;
    },
  });
});
