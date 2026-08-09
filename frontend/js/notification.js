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
      notificationForm: document.getElementById("notificationForm"),
      notificationUserId: document.getElementById("notificationUserId"),
      notificationList: document.getElementById("notificationList"),
      notificationStatus: document.getElementById("notificationStatus"),
    };
  }

  function setStatus(message, isError = false) {
    const { notificationStatus } = getElements();
    if (!notificationStatus) return;
    notificationStatus.textContent = message;
    notificationStatus.style.color = isError ? "#dc2626" : "";
  }

  function renderEmpty(message) {
    const { notificationList } = getElements();
    if (!notificationList) return;
    notificationList.innerHTML = `<div class="notification-empty">${CakeDelightUI.escapeHtml(message)}</div>`;
  }

  function renderNotifications(notifications) {
    const { notificationList } = getElements();
    if (!notificationList) return;

    if (!notifications.length) {
      renderEmpty("No notifications found for this user.");
      setStatus("No notifications found.");
      return;
    }

    notificationList.innerHTML = notifications
      .map(
        (notification) => `
          <article class="notification-card">
            <div class="notification-head">
              <h3 class="notification-title">Order ${CakeDelightUI.escapeHtml(notification.orderId || "N/A")}</h3>
              <span class="pill notification-status">${CakeDelightUI.escapeHtml(notification.status || "PENDING")}</span>
            </div>
            <p>${CakeDelightUI.escapeHtml(notification.message || "No message available.")}</p>
            <div class="notification-meta">
              <span class="muted-text">Created: ${CakeDelightUI.formatDateTime(notification.createdAt)}</span>
              <span class="muted-text">User: ${CakeDelightUI.escapeHtml(notification.userId || "N/A")}</span>
            </div>
          </article>
        `
      )
      .join("");

    setStatus(`Loaded ${notifications.length} notification${notifications.length === 1 ? "" : "s"}.`);
  }

  async function loadNotifications(userId) {
    setStatus("Loading notifications...");

    try {
      const response = await CakeDelightAPI.getNotificationsByUserId(userId);
      const notifications = CakeDelightUI.normalizeResponse(response);
      renderNotifications(notifications);
    } catch (error) {
      renderEmpty(error.message || "Unable to load notifications.");
      setStatus(error.message || "Unable to load notifications.", true);
    }
  }

  function init() {
    const { notificationForm, notificationUserId } = getElements();
    const userId = getUserId();

    if (notificationUserId) {
      notificationUserId.value = userId;
    }

    if (notificationForm) {
      notificationForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const currentUserId = notificationUserId ? notificationUserId.value.trim() : userId;
        if (!currentUserId) {
          setStatus("User Id is required.", true);
          return;
        }
        loadNotifications(currentUserId);
      });
    }

    loadNotifications(userId);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
