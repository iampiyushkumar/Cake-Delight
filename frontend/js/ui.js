const CakeDelightUI = (() => {
  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatCurrency(value) {
    const amount = Number(value || 0);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatDateTime(value) {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";

    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  function normalizeResponse(payload) {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (payload.order) return [payload.order];
    return [];
  }

  function ratingLabel(score) {
    const value = Number(score || 0);
    if (!value) return "No ratings yet";
    return `${value.toFixed(1)} / 5`;
  }

  function availabilityLabel(isAvailable) {
    return isAvailable ? "Available" : "Out of stock";
  }

  function createStarDisplay(rating = 0) {
    const value = Math.max(0, Math.min(5, Number(rating) || 0));
    const fullStars = Math.round(value);
    return "★".repeat(fullStars) + "☆".repeat(5 - fullStars);
  }

  function setText(element, text) {
    if (element) element.textContent = text;
  }

  function openModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.add("open");
    modalElement.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.remove("open");
    modalElement.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function bindModalClose(modalElement) {
    if (!modalElement) return;
    modalElement.addEventListener("click", (event) => {
      const target = event.target;
      if (target && target.hasAttribute && target.hasAttribute("data-close-modal")) {
        closeModal(modalElement);
      }
    });
  }

  function showMessage(container, message, type = "info") {
    if (!container) return;
    container.innerHTML = "";
    const box = document.createElement("div");
    box.className = `${type}-state`;
    box.textContent = message;
    container.appendChild(box);
  }

  function createTagList(items = []) {
    return items
      .filter(Boolean)
      .map((item) => `<span class="pill">${escapeHtml(item)}</span>`)
      .join("");
  }

  return {
    escapeHtml,
    formatCurrency,
    formatDateTime,
    normalizeResponse,
    ratingLabel,
    availabilityLabel,
    createStarDisplay,
    setText,
    openModal,
    closeModal,
    bindModalClose,
    showMessage,
    createTagList,
  };
})();

window.CakeDelightUI = CakeDelightUI;
