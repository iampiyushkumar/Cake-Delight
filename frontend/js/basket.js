(function () {
  function getUserId() {
    let userId = localStorage.getItem("cakeDelightUserId");
    if (!userId) {
      userId = `user-${Date.now()}`;
      localStorage.setItem("cakeDelightUserId", userId);
    }
    return userId;
  }

  function getElements() {
    return {
      basketItems: document.getElementById("basketItems"),
      basketStatus: document.getElementById("basketStatus"),
      basketUserId: document.getElementById("basketUserId"),
      basketItemCount: document.getElementById("basketItemCount"),
      basketTotalPrice: document.getElementById("basketTotalPrice"),
      basketItemTemplate: document.getElementById("basketItemTemplate"),
    };
  }

  function setStatus(message, isError = false) {
    const { basketStatus } = getElements();
    if (!basketStatus) return;
    basketStatus.textContent = message;
    basketStatus.style.color = isError ? "#dc2626" : "";
  }

  function renderEmpty(message) {
    const { basketItems } = getElements();
    if (!basketItems) return;
    basketItems.innerHTML = `<div class="empty-state">${CakeDelightUI.escapeHtml(message)}</div>`;
  }

  function updateSummary(basket) {
    const { basketUserId, basketItemCount, basketTotalPrice } = getElements();
    if (basketUserId) basketUserId.textContent = getUserId();

    const itemCount = (basket.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    if (basketItemCount) basketItemCount.textContent = String(itemCount);
    if (basketTotalPrice) basketTotalPrice.textContent = CakeDelightUI.formatCurrency(basket.totalPrice || 0);
  }

  async function loadBasket() {
    const { basketItems, basketUserId } = getElements();
    const userId = getUserId();

    if (basketUserId) {
      basketUserId.textContent = userId;
    }

    setStatus("Loading basket...");

    try {
      const basket = await CakeDelightAPI.getBasket(userId);
      updateSummary(basket);

      if (!basket.items || !basket.items.length) {
        renderEmpty("Your basket is empty.");
        setStatus("No items in basket.");
        return;
      }

      renderBasketItems(basket.items);
      setStatus(`Loaded ${basket.items.length} item${basket.items.length === 1 ? "" : "s"}.`);
    } catch (error) {
      renderEmpty(error.message || "Unable to load basket.");
      setStatus(error.message || "Unable to load basket.", true);
    }
  }

  function renderBasketItems(items) {
    const { basketItems, basketItemTemplate } = getElements();
    if (!basketItems || !basketItemTemplate) return;

    basketItems.innerHTML = "";

    items.forEach((item) => {
      const node = basketItemTemplate.content.cloneNode(true);
      const name = node.querySelector(".basket-item-name");
      const price = node.querySelector(".basket-item-price");
      const quantityValue = node.querySelector(".basket-quantity-value");
      const subtotal = node.querySelector(".basket-item-subtotal");
      const quantityDown = node.querySelector(".quantity-down");
      const quantityUp = node.querySelector(".quantity-up");
      const removeItem = node.querySelector(".remove-item");

      name.textContent = item.name || "Unnamed Cake";
      price.textContent = `Price: ${CakeDelightUI.formatCurrency(item.price)}`;
      quantityValue.textContent = String(item.quantity || 1);
      subtotal.textContent = `Subtotal: ${CakeDelightUI.formatCurrency((item.price || 0) * (item.quantity || 1))}`;

      quantityDown.addEventListener("click", () => updateQuantity(item, Number(item.quantity || 1) - 1));
      quantityUp.addEventListener("click", () => updateQuantity(item, Number(item.quantity || 1) + 1));
      removeItem.addEventListener("click", () => deleteItem(item));

      basketItems.appendChild(node);
    });
  }

  async function updateQuantity(item, quantity) {
    const userId = getUserId();

    try {
      await CakeDelightAPI.updateBasketItem(userId, item.productId || item._id, quantity);
      await loadBasket();
    } catch (error) {
      setStatus(error.message || "Unable to update quantity.", true);
    }
  }

  async function deleteItem(item) {
    const userId = getUserId();

    try {
      await CakeDelightAPI.deleteBasketItem(userId, item.productId || item._id);
      await loadBasket();
    } catch (error) {
      setStatus(error.message || "Unable to remove item.", true);
    }
  }

  function init() {
    const { basketUserId } = getElements();
    if (basketUserId) basketUserId.textContent = getUserId();
    loadBasket();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
