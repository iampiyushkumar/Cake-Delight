(function () {
  const state = {
    cakes: [],
    activeCake: null,
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
      createCakeForm: document.getElementById("createCakeForm"),
      createCakeStatus: document.getElementById("createCakeStatus"),
      cakeName: document.getElementById("cakeName"),
      cakeDescription: document.getElementById("cakeDescription"),
      cakeCategory: document.getElementById("cakeCategory"),
      cakePrice: document.getElementById("cakePrice"),
      cakeImage: document.getElementById("cakeImage"),
      cakeAvailability: document.getElementById("cakeAvailability"),
      filterForm: document.getElementById("filterForm"),
      searchInput: document.getElementById("searchInput"),
      categorySelect: document.getElementById("categorySelect"),
      minPriceInput: document.getElementById("minPriceInput"),
      maxPriceInput: document.getElementById("maxPriceInput"),
      cakeGrid: document.getElementById("cakeGrid"),
      catalogStatus: document.getElementById("catalogStatus"),
      cakeModal: document.getElementById("cakeModal"),
      modalContent: document.getElementById("modalContent"),
      cardTemplate: document.getElementById("cakeCardTemplate"),
    };
  }

  function setStatus(message, isError = false) {
    const { catalogStatus } = getElements();
    if (!catalogStatus) return;
    catalogStatus.textContent = message;
    catalogStatus.style.color = isError ? "#dc2626" : "";
  }

  function setCreateStatus(message, isError = false) {
    const { createCakeStatus } = getElements();
    if (!createCakeStatus) return;
    createCakeStatus.textContent = message;
    createCakeStatus.style.color = isError ? "#dc2626" : "";
  }

  function renderPlaceholder(message, className = "empty-state") {
    const { cakeGrid } = getElements();
    if (!cakeGrid) return;
    cakeGrid.innerHTML = `<div class="${className}">${CakeDelightUI.escapeHtml(message)}</div>`;
  }

  async function loadCakes(filters = {}) {
    const { cakeGrid } = getElements();
    setStatus("Loading cakes...");
    if (!cakeGrid) return;

    try {
      const response = await CakeDelightAPI.getCakes(filters);
      const cakes = CakeDelightUI.normalizeResponse(response);
      state.cakes = cakes;

      if (!cakes.length) {
        renderPlaceholder("No cakes found for the selected filters.");
        setStatus("No cakes available.");
        return;
      }

      renderCakes(cakes);
      setStatus(`Showing ${cakes.length} cake${cakes.length === 1 ? "" : "s"}.`);
    } catch (error) {
      renderPlaceholder(error.message || "Unable to load cakes.", "error-state");
      setStatus(error.message || "Unable to load cakes.", true);
    }
  }

  function renderCakes(cakes) {
    const { cakeGrid, cardTemplate } = getElements();
    if (!cakeGrid || !cardTemplate) return;

    cakeGrid.innerHTML = "";

    cakes.forEach((cake) => {
      const node = cardTemplate.content.cloneNode(true);
      const card = node.querySelector(".cake-card");
      const image = node.querySelector(".cake-image");
      const name = node.querySelector(".cake-name");
      const price = node.querySelector(".cake-price");
      const category = node.querySelector(".cake-category");
      const availability = node.querySelector(".cake-availability");
      const rating = node.querySelector(".cake-rating");
      const viewDetailsBtn = node.querySelector(".view-details-btn");
      const addBasketBtn = node.querySelector(".add-basket-btn");

      image.src = cake.image || "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80";
      image.alt = cake.name ? `${cake.name} cake` : "Cake image";

      CakeDelightUI.setText(name, cake.name || "Unnamed Cake");
      CakeDelightUI.setText(price, CakeDelightUI.formatCurrency(cake.price));
      CakeDelightUI.setText(category, `Category: ${cake.category || "N/A"}`);
      CakeDelightUI.setText(availability, CakeDelightUI.availabilityLabel(cake.availability));
      availability.classList.toggle("unavailable", !cake.availability);
      CakeDelightUI.setText(rating, `Average Rating: ${cake.averageRating ? cake.averageRating.toFixed(1) : "N/A"}`);

      viewDetailsBtn.addEventListener("click", () => openDetails(cake));
      addBasketBtn.addEventListener("click", () => addCakeToBasket(cake));

      cakeGrid.appendChild(node);

      if (!cake.availability) {
        card.style.opacity = "0.9";
      }
    });
  }

  async function openDetails(cake) {
    const { cakeModal, modalContent } = getElements();
    if (!cakeModal || !modalContent) return;

    modalContent.innerHTML = `
      <div class="detail-layout">
        <img class="detail-image" src="${CakeDelightUI.escapeHtml(cake.image || "")}" alt="${CakeDelightUI.escapeHtml(cake.name || "Cake")}" />
        <div class="detail-info">
          <h3 id="cakeModalTitle">${CakeDelightUI.escapeHtml(cake.name || "Cake Details")}</h3>
          <p id="detailCategory" class="muted-text">${CakeDelightUI.escapeHtml(cake.category || "N/A")}</p>
          <p id="detailDescription">${CakeDelightUI.escapeHtml(cake.description || "No description available.")}</p>
          <div class="detail-meta">
            <span><strong>Price:</strong> <span id="detailPrice">${CakeDelightUI.formatCurrency(cake.price)}</span></span>
            <span><strong>Availability:</strong> <span id="detailAvailability">${CakeDelightUI.escapeHtml(CakeDelightUI.availabilityLabel(cake.availability))}</span></span>
            <span><strong>Average Rating:</strong> <span id="detailAverageRating">Loading...</span></span>
            <span><strong>Cake ID:</strong> <span id="detailCakeId">${CakeDelightUI.escapeHtml(cake._id || "N/A")}</span></span>
          </div>

          <label class="field">
            <span>Quantity</span>
            <input id="detailQuantity" type="number" min="1" step="1" value="1" />
          </label>

          <div class="detail-actions">
            <button type="button" class="btn btn-primary" id="detailAddToBasket">Add To Basket</button>
            <button type="button" class="btn btn-secondary" data-close-modal>Close</button>
          </div>
        </div>
      </div>
    `;

    CakeDelightUI.openModal(cakeModal);

    const detailAverageRating = modalContent.querySelector("#detailAverageRating");
    const detailAddToBasket = modalContent.querySelector("#detailAddToBasket");
    const detailQuantity = modalContent.querySelector("#detailQuantity");

    detailAddToBasket.addEventListener("click", () => addCakeToBasket(cake, Number(detailQuantity.value || 1)));

    try {
      const freshCake = await CakeDelightAPI.getCakeById(cake._id);
      const activeCake = freshCake?.data || freshCake;
      state.activeCake = activeCake;

      modalContent.querySelector(".detail-image").src =
        activeCake.image || cake.image || "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80";
      modalContent.querySelector("#cakeModalTitle").textContent = activeCake.name || cake.name || "Cake Details";
      modalContent.querySelector("#detailCategory").textContent = activeCake.category || cake.category || "N/A";
      modalContent.querySelector("#detailDescription").textContent = activeCake.description || cake.description || "No description available.";
      modalContent.querySelector("#detailPrice").textContent = CakeDelightUI.formatCurrency(activeCake.price || cake.price);
      modalContent.querySelector("#detailAvailability").textContent = CakeDelightUI.availabilityLabel(activeCake.availability ?? cake.availability);
      modalContent.querySelector("#detailCakeId").textContent = activeCake._id || cake._id || "N/A";

      const ratingResponse = await CakeDelightAPI.getAverageRating(activeCake._id || cake._id);
      const average = Number(ratingResponse?.averageRating || 0);
      const totalRatings = Number(ratingResponse?.totalRatings || 0);
      detailAverageRating.textContent = totalRatings ? `${average.toFixed(1)} / 5 (${totalRatings})` : "No ratings yet";
      state.activeCake = {
        ...activeCake,
        averageRating: average,
        totalRatings,
      };
    } catch (error) {
      detailAverageRating.textContent = "Unavailable";
    }
  }

  async function handleCreateCake(event) {
    event.preventDefault();
    const {
      cakeName,
      cakeDescription,
      cakeCategory,
      cakePrice,
      cakeImage,
      cakeAvailability,
    } = getElements();

    const payload = {
      name: cakeName ? cakeName.value.trim() : "",
      description: cakeDescription ? cakeDescription.value.trim() : "",
      category: cakeCategory ? cakeCategory.value : "",
      price: cakePrice ? Number(cakePrice.value) : 0,
      image: cakeImage ? cakeImage.value.trim() : "",
      availability: cakeAvailability ? cakeAvailability.checked : true,
    };

    if (!payload.name || !payload.description || !payload.category || !payload.image || Number.isNaN(payload.price)) {
      setCreateStatus("Please fill in all cake fields.", true);
      return;
    }

    try {
      await CakeDelightAPI.createCake(payload);
      setCreateStatus("Cake created successfully.");
      if (cakeName) cakeName.value = "";
      if (cakeDescription) cakeDescription.value = "";
      if (cakeCategory) cakeCategory.value = "";
      if (cakePrice) cakePrice.value = "";
      if (cakeImage) cakeImage.value = "";
      if (cakeAvailability) cakeAvailability.checked = true;
      await loadCakes(getFiltersFromForm());
    } catch (error) {
      setCreateStatus(error.message || "Unable to create cake.", true);
    }
  }

  async function addCakeToBasket(cake, quantity = 1) {
    const qty = Math.max(1, Number(quantity) || 1);
    const userId = getUserId();

    try {
      await CakeDelightAPI.addToBasket({
        userId,
        productId: cake._id,
        name: cake.name,
        price: cake.price,
        quantity: qty,
      });

      setStatus(`${cake.name} added to basket.`);
    } catch (error) {
      setStatus(error.message || "Unable to add to basket.", true);
    }
  }

  function getFiltersFromForm() {
    const { searchInput, categorySelect, minPriceInput, maxPriceInput } = getElements();
    return {
      name: searchInput ? searchInput.value.trim() : "",
      category: categorySelect ? categorySelect.value : "",
      minPrice: minPriceInput ? minPriceInput.value.trim() : "",
      maxPrice: maxPriceInput ? maxPriceInput.value.trim() : "",
    };
  }

  function attachEvents() {
    const { filterForm, cakeModal, createCakeForm } = getElements();

    if (filterForm) {
      filterForm.addEventListener("submit", (event) => {
        event.preventDefault();
        loadCakes(getFiltersFromForm());
      });
    }

    if (createCakeForm) {
      createCakeForm.addEventListener("submit", handleCreateCake);
    }

    if (cakeModal) {
      CakeDelightUI.bindModalClose(cakeModal);
    }
  }

  function init() {
    attachEvents();
    loadCakes();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
