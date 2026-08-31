const CakeDelightAPI = (() => {
  const BASE_URL = "http://localhost:8080";

  async function request(path, options = {}) {
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    };

    const response = await fetch(`${BASE_URL}${path}`, config);
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message =
        (data && data.message) ||
        (typeof data === "string" && data.trim()) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return data;
  }

  function getCakes(params = {}) {
    const search = new URLSearchParams();

    if (params.category) search.set("category", params.category);
    if (params.name) search.set("name", params.name);
    if (params.minPrice !== undefined && params.minPrice !== "") {
      search.set("minPrice", params.minPrice);
    }
    if (params.maxPrice !== undefined && params.maxPrice !== "") {
      search.set("maxPrice", params.maxPrice);
    }

    const query = search.toString();
    return request(`/catalog/cakes${query ? `?${query}` : ""}`);
  }

  function getCakeById(id) {
    return request(`/catalog/cakes/${encodeURIComponent(id)}`);
  }

  function createCake(payload) {
    return request("/catalog/cakes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  function getBasket(userId) {
    const query = new URLSearchParams({ userId });
    return request(`/orders/api/basket?${query.toString()}`);
  }

  function addToBasket(payload) {
    return request("/orders/api/basket", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  function updateBasketItem(userId, id, quantity) {
    return request(`/orders/api/basket/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify({ userId, quantity }),
    });
  }

  function deleteBasketItem(userId, id) {
    const query = new URLSearchParams({ userId });
    return request(`/orders/api/basket/${encodeURIComponent(id)}?${query.toString()}`, {
      method: "DELETE",
    });
  }

  function checkout(payload) {
    return request("/orders/api/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  function createRating(payload) {
    return request("/ratings/ratings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  function getRatingsByCakeId(cakeId) {
    return request(`/ratings/ratings/${encodeURIComponent(cakeId)}`);
  }

  function getAverageRating(cakeId) {
    return request(`/ratings/ratings/${encodeURIComponent(cakeId)}/average`);
  }

function getAllNotifications() {
  return request("/notifications/notifications");
}

function getNotificationsByUserId(userId) {
  return request(`/notifications/notifications/${encodeURIComponent(userId)}`);
}

  return {
    BASE_URL,
    request,
    getCakes,
    getCakeById,
    createCake,
    getBasket,
    addToBasket,
    updateBasketItem,
    deleteBasketItem,
    checkout,
    createRating,
    getRatingsByCakeId,
    getAverageRating,
    getAllNotifications,
    getNotificationsByUserId,
  };
})();

window.CakeDelightAPI = CakeDelightAPI;
