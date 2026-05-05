document.addEventListener("DOMContentLoaded", () => {
  const cartContainer = document.getElementById("cartList");
  const totalContainer = document.getElementById("cartTotal");
  const sendBtn = document.getElementById("sendWhatsApp");
  const clearBtn = document.getElementById("clearCartBtn");

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  }

  function setCart(nextCart) {
    localStorage.setItem("cart", JSON.stringify(nextCart));
    window.dispatchEvent(new Event("storage"));
  }

  let cart = getCart();

  function updateCartView() {
    cartContainer.innerHTML = "";
    let total = 0;
    let totalGB = 0;

    if (!cart || cart.length === 0) {
      cartContainer.innerHTML =
        "<li style='color: #888; padding: 10px;'>Tu carrito está vacío.</li>";
      totalContainer.innerHTML =
        "Total: 0 Gb | <span style='color: #ff4444;'>0 Cup</span>";
      return;
    }

    cart.forEach((game, index) => {
      // ESTA PARTE ES LA CLAVE: Lee el formato nuevo (n, pr) O el viejo (Nombre, Precio)
      const nombre = game.n || game.Nombre || "Juego";
      const plataforma = game.p || game.Plataforma || "PC";
      const tamañoRaw = game.t || game.Tamaño || "0 Gb";
      const precioRaw = game.pr || game.Precio || 0;

      const tamañoStr = tamañoRaw.toString().toLowerCase().replace("gb", "Gb");

      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";
      li.style.padding = "10px 0";
      li.style.borderBottom = "1px solid #333";

      li.innerHTML = `
        <span>
          <strong style="color: #4caf50;">${nombre}</strong>
          <small style="color: #888; margin-left: 5px;">[${plataforma}]</small>
          <br>
          <span style="color: #ccc; font-size: 0.9em;">${tamañoStr} - ${precioRaw} Cup</span>
        </span>
      `;

      const removeBtn = document.createElement("button");
      removeBtn.innerHTML = "❌";
      removeBtn.style.background = "none";
      removeBtn.style.border = "none";
      removeBtn.style.cursor = "pointer";
      removeBtn.style.fontSize = "1.2rem";
      removeBtn.onclick = () => {
        cart.splice(index, 1);
        setCart(cart);
        updateCartView();
      };

      li.appendChild(removeBtn);
      cartContainer.appendChild(li);

      const p = parseFloat(precioRaw);
      if (!isNaN(p)) total += p;

      const gb = parseFloat(tamañoStr);
      if (!isNaN(gb)) totalGB = Math.round((totalGB + gb) * 100) / 100;
    });

    // TOTAL EN ROJO resaltado
    totalContainer.innerHTML = `Total: <span style="color: #4caf50;">${Math.round(totalGB)} Gb</span> | <span style="color: #ff4444; font-weight: bold; font-size: 1.2em;">${total} Cup</span>`;
  }

  function vaciarCarrito() {
    localStorage.removeItem("cart");
    cart = [];
    updateCartView();
    window.dispatchEvent(new Event("storage"));
  }

  if (sendBtn) {
    sendBtn.addEventListener("click", () => {
      cart = getCart();
      if (!cart || cart.length === 0) return;

      let message = "🛒 *NUEVO PEDIDO - ROBER® PC*\n\n";
      let total = 0;
      let totalGB = 0;

      cart.forEach((g, index) => {
        const nombre = g.n || g.Nombre || "Juego";
        const plataforma = g.p || g.Plataforma || "PC";
        const precio = parseFloat(g.pr || g.Precio || 0);
        const tamaño = (g.t || g.Tamaño || "0")
          .toString()
          .toLowerCase()
          .replace("gb", "Gb");

        total += precio;
        const gb = parseFloat(tamaño);
        if (!isNaN(gb)) totalGB += gb;

        message += `*${index + 1}.* ${nombre} [${plataforma}] (${tamaño}) - ${precio} Cup\n`;
      });

      message += `\n💰 *Total:* ${total} Cup\n📦 *Espacio:* ${Math.round(totalGB)} Gb`;

      const url = `https://wa.me/5358024782?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("¿Seguro que quieres vaciar todo el carrito?")) {
        vaciarCarrito();
      }
    });
  }

  updateCartView();
});
