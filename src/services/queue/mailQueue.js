const { Queue } = require("bullmq");
const redis = require("../../lib/redis"); // File redis của bạn
// Khởi tạo queue
const emailQueue = new Queue("emailQueue", { connection: redis });

// Hàm thêm job gửi mail với thời gian lên lịch
async function scheduleEmail({ to, subject, text, sendAt }) {
  try {
    await emailQueue.add(
      "sendEmail",
      { to, subject, text },
      {
        delay: sendAt ? sendAt.getTime() - Date.now() : 0, // Tính thời gian delay (mili giây)
        attempts: 3, // Thử lại 3 lần nếu job thất bại
      }
    );
    console.log(`Email to ${to} scheduled at ${sendAt}`);
  } catch (error) {
    console.error("Error scheduling email:", error);
  }
}

module.exports = { emailQueue, scheduleEmail };
