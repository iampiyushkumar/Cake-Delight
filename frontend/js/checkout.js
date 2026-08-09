(function () {
  const state = {
    order: null,
  };

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
      checkoutForm: document.getElementById("checkoutForm"),
      checkoutUserId: document.getElementById("checkoutUserId"),
      shippingAddress: document.getElementById("shippingAddress"),
      checkoutStatus: document.getElementById("checkoutStatus"),
      checkoutSuccess: document.getElementById("checkoutSuccess"),
      checkoutOrderSummary: document.getElementById("checkoutOrderSummary"),
      ratingSection: document.getElementById("ratingSection"),
    };
  }

  function setStatus(message, isError = false) {
    const { checkoutStatus } = getElements();
    if (!checkoutStatus) return;
    checkoutStatus.textContent = message;
    checkoutStatus.style.color = isError ? "#dc2626" : "";
  }

  function renderOrderSummary(order) {
    const { checkoutOrderSummary } = getElements();
    if (!checkoutOrderSummary) return;

    const items = order.items || [];
    checkoutOrderSummary.innerHTML = `
      <div class="summary-row"><span>Order Id</span><strong>${CakeDelightUI.escapeHtml(order._id || "N/A")}</strong></div>
      <div class="summary-row"><span>User Id</span><strong>${CakeDelightUI.escapeHtml(order.userId || "N/A")}</strong></div>
      <div class="summary-row"><span>Status</span><strong>${CakeDelightUI.escapeHtml(order.status || "PENDING")}</strong></div>
      <div class="summary-row"><span>Total Price</span><strong>${CakeDelightUI.formatCurrency(order.totalPrice || 0)}</strong></div>
      <div class="summary-row total"><span>Items</span><strong>${items.length}</strong></div>
      <div class="notification-grid">
        ${items
          .map(
            (item) => `
              <div class="notification-card">
                <div class="notification-head">
                  <h4 class="notification-title">${CakeDelightUI.escapeHtml(item.name || "Cake")}</h4>
                  <span class="pill">${CakeDelightUI.formatCurrency((item.price || 0) * (item.quantity || 1))}</span>
                </div>
                <p class="muted-text">Quantity: ${CakeDelightUI.escapeHtml(item.quantity || 1)}</p>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  function restoreLastOrder() {
    const saved = localStorage.getItem("cakeDelightLastOrder");
    if (!saved) return;

    try {
      const order = JSON.parse(saved);
      if (order && order._id) {
        state.order = order;
        renderOrderSummary(order);
        showCheckoutSuccess();
        showRatingSection(order);
      }
    } catch (error) {
      localStorage.removeItem("cakeDelightLastOrder");
    }
  }

  function showCheckoutSuccess() {
    const { checkoutSuccess } = getElements();
    if (!checkoutSuccess) return;
    checkoutSuccess.hidden = false;
  }

  function showRatingSection(order) {
    const { ratingSection } = getElements();
    if (!ratingSection) return;
    ratingSection.hidden = false;

    window.dispatchEvent(
      new CustomEvent("cake-delight:order-created", {
        detail: { order },
      })
    );
  }

  async function handleCheckout(event) {
    event.preventDefault();
    const { shippingAddress, checkoutUserId } = getElements();
    const userId = getUserId();
    const address = shippingAddress ? shippingAddress.value.trim() : "";

    if (!address) {
      setStatus("Shipping address is required.", true);
      return;
    }

    try {
      const response = await CakeDelightAPI.checkout({
        userId,
        shippingAddress: address,
      });

      const order = response.order || response.data || response;
      state.order = order;
      localStorage.setItem("cakeDelightLastOrder", JSON.stringify(order));

      if (checkoutUserId) checkoutUserId.value = userId;
      renderOrderSummary(order);
      showCheckoutSuccess();
      showRatingSection(order);
      setStatus("Order Created Successfully");
    } catch (error) {
      setStatus(error.message || "Unable to place order.", true);
    }
  }

  function init() {
    const { checkoutForm, checkoutUserId } = getElements();
    if (checkoutUserId) checkoutUserId.value = getUserId();

    if (checkoutForm) {
      checkoutForm.addEventListener("submit", handleCheckout);
    }

    restoreLastOrder();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.CakeDelightCheckoutState = state;
})();
