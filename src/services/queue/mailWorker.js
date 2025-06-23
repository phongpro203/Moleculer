const { Worker } = require("bullmq");
const redis = require("../../lib/redis");
const sendMail = require("../../helpers/sendMail");

// Khởi tạo worker
const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    const { to, subject, text } = job.data;

    await sendMail(to, subject, text);
  },
  { connection: redis, limiter: { max: 10, duration: 60000 } }
);

// Xử lý lỗi worker
emailWorker.on("error", (error) => {
  console.error("Worker error:", error);
});

module.exports = emailWorker;
