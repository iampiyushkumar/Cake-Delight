const Notification = require("../models/Notification");

exports.sendOrderConfirmation = async (jobData) => {
  const { orderId, userId, totalPrice, items } = jobData;

  const message = `Order #${orderId} has been placed successfully. Total: ₹${totalPrice}`;

  // 1. Save initial record with PENDING status
  const notification = await Notification.create({
    orderId: orderId || "N/A",
    userId: userId || "anonymous",
    message,
    status: "PENDING",
  });

  try {
    // 2. Simulate sending email/SMS output to console
    console.log("\n--------------------------------------");
    console.log("EMAIL SENT (SIMULATION)");
    console.log(`User  : ${notification.userId}`);
    console.log(`Order : ${notification.orderId}`);
    if (totalPrice) console.log(`Total : ₹${totalPrice}`);
    if (items && items.length) console.log(`Items : ${items.length} item(s)`);
    console.log("--------------------------------------\n");

    // 3. Update status to SENT
    notification.status = "SENT";
    await notification.save();

    return notification;
  } catch (error) {
    console.error(`Failed to process notification for order ${orderId}:`, error);
    notification.status = "FAILED";
    await notification.save();
    throw error;
  }
};