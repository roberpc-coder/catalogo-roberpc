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
      cartContainer.innerHTML = "<li>Tu carrito está vacío.</li>";
      totalContainer.textContent = "Total: 0 Gb | 0 CUP";
      return;
    }

    cart.forEach((game, index) => {
      const li = document.createElement("li");
      const plataforma = game.Plataforma ?? game.plataforma ?? "Sin plataforma";
      const tamaño = game.Tamaño?.replace(/GB|gb/g, "Gb");
      li.textContent = `${game.Nombre} [${plataforma}] (${tamaño}) - ${game.Precio} Cup`;

      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-btn";
      removeBtn.textContent = "❌";
      removeBtn.onclick = () => {
        cart.splice(index, 1);
        setCart(cart);
        updateCartView();
      };

      li.appendChild(removeBtn);
      cartContainer.appendChild(li);

      const p = parseFloat(game.Precio);
      if (!isNaN(p)) total += p;

      const gb = parseFloat(game.Tamaño);
      if (!isNaN(gb)) totalGB = Math.round((totalGB + gb) * 100) / 100; // ✅ evita residuos
    });

    totalContainer.textContent = `Total: ${Math.round(
      totalGB
    )} Gb | ${total} Cup`; // ✅ limpio
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

      let message = "🛒 Lista de juegos:\n\n";
      let total = 0;
      let totalGB = 0;

      cart.forEach((g) => {
        const precio = parseFloat(g.Precio);
        const gb = parseFloat(g.Tamaño);
        if (!isNaN(precio)) total += precio;
        if (!isNaN(gb)) totalGB = Math.round((totalGB + gb) * 100) / 100; // ✅ evita residuos

        const tamaño = g.Tamaño?.replace(/GB|gb/g, "Gb");
        const plataforma = g.Plataforma ?? g.plataforma ?? "Sin plataforma";
        message += `- ${g.Nombre} [${plataforma}] (${tamaño}) - ${precio} Cup\n`;
      });

      message += `\nTotal: ${Math.round(totalGB)} Gb | ${total} Cup`; // ✅ limpio

      const url = `https://wa.me/5358024782?text=${encodeURIComponent(
        message
      )}`;
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
