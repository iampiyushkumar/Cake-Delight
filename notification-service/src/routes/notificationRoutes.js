const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.get("/", notificationController.getAllNotifications);
router.get("/:userId", notificationController.getNotificationsByUserId);

module.exports = router;