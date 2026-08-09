(function () {
  const state = {
    selectedCakeId: "",
    rating: 5,
    order: null,
  };

  function getUserId() {
    return localStorage.getItem("cakeDelightUserId") || "anonymous";
  }

  function getElements() {
    return {
      ratingSection: document.getElementById("ratingSection"),
      ratingCakeSelect: document.getElementById("ratingCakeSelect"),
      ratingStars: document.getElementById("ratingStars"),
      ratingComment: document.getElementById("ratingComment"),
      ratingAverage: document.getElementById("ratingAverage"),
      ratingMessage: document.getElementById("ratingMessage"),
      ratingSubmit: document.getElementById("ratingSubmit"),
    };
  }

  function setMessage(message, isError = false) {
    const { ratingMessage } = getElements();
    if (!ratingMessage) return;
    ratingMessage.textContent = message;
    ratingMessage.style.color = isError ? "#dc2626" : "";
  }

  function getOrderItems(order) {
    const items = Array.isArray(order?.items) ? order.items : [];
    const seen = new Set();

    return items.filter((item) => {
      const id = item.productId || item._id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }

  function renderStars() {
    const { ratingStars } = getElements();
    if (!ratingStars) return;

    ratingStars.innerHTML = "";

    for (let value = 1; value <= 5; value += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `star-btn${value <= state.rating ? " active" : ""}`;
      button.textContent = "★";
      button.setAttribute("aria-label", `${value} star${value > 1 ? "s" : ""}`);
      button.addEventListener("click", () => {
        state.rating = value;
        renderStars();
      });
      ratingStars.appendChild(button);
    }
  }

  async function updateAverage(cakeId) {
    const { ratingAverage } = getElements();
    if (!ratingAverage || !cakeId) return;

    try {
      const response = await CakeDelightAPI.getAverageRating(cakeId);
      const average = Number(response?.averageRating || 0);
      const totalRatings = Number(response?.totalRatings || 0);
      ratingAverage.textContent = totalRatings ? `${average.toFixed(1)} / 5 (${totalRatings})` : "No ratings yet";
    } catch (error) {
      ratingAverage.textContent = "Unavailable";
    }
  }

  function populateOrder(order) {
    const { ratingSection, ratingCakeSelect } = getElements();
    if (!ratingSection || !ratingCakeSelect) return;

    state.order = order;
    const items = getOrderItems(order);

    if (!items.length) {
      ratingSection.hidden = true;
      return;
    }

    ratingSection.hidden = false;
    ratingCakeSelect.innerHTML = items
      .map((item) => `<option value="${CakeDelightUI.escapeHtml(item.productId || item._id)}">${CakeDelightUI.escapeHtml(item.name || "Cake")}</option>`)
      .join("");

    state.selectedCakeId = items[0].productId || items[0]._id || "";
    ratingCakeSelect.value = state.selectedCakeId;
    renderStars();
    updateAverage(state.selectedCakeId);
  }

  async function submitRating() {
    const { ratingCakeSelect, ratingComment } = getElements();
    const cakeId = (ratingCakeSelect && ratingCakeSelect.value) || state.selectedCakeId;
    const comment = (ratingComment && ratingComment.value.trim()) || "";

    if (!cakeId) {
      setMessage("Please select a cake.", true);
      return;
    }

    try {
      await CakeDelightAPI.createRating({
        cakeId,
        rating: state.rating,
        comment,
        userId: getUserId(),
      });

      setMessage("Rating submitted successfully.");
      if (ratingComment) ratingComment.value = "";
      await updateAverage(cakeId);
    } catch (error) {
      setMessage(error.message || "Unable to submit rating.", true);
    }
  }

  function attachEvents() {
    const { ratingCakeSelect, ratingSubmit } = getElements();

    if (ratingCakeSelect) {
      ratingCakeSelect.addEventListener("change", () => {
        state.selectedCakeId = ratingCakeSelect.value;
        updateAverage(state.selectedCakeId);
      });
    }

    if (ratingSubmit) {
      ratingSubmit.addEventListener("click", submitRating);
    }

    window.addEventListener("cake-delight:order-created", (event) => {
      populateOrder(event.detail?.order);
    });
  }

  function restoreOrder() {
    const saved = localStorage.getItem("cakeDelightLastOrder");
    if (!saved) return;

    try {
      const order = JSON.parse(saved);
      if (order && order._id) {
        populateOrder(order);
      }
    } catch (error) {
      localStorage.removeItem("cakeDelightLastOrder");
    }
  }

  function init() {
    attachEvents();
    renderStars();
    restoreOrder();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
