const { MoleculerError } = require("moleculer").Errors;
const rateLimit = require("express-rate-limit");
const redis = require("../lib/redis");

const verifyOtpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    // Ưu tiên email từ body, nếu không có thì dùng IP hoặc userId từ cookie
    return req.body.email || req.ip || req.cookies.userId || "anonymous";
  },
  handler: async (req, res, next) => {
    const email = req.body.email;
    if (email) {
      try {
        await redis.del(`otp:${email}`); // Xóa OTP trong Redis
      } catch (err) {
        console.error("Error deleting OTP from Redis:", err);
      }
    }

    // Gửi phản hồi HTTP trực tiếp mà không ném lỗi
    res.setHeader("Content-Type", "application/json");
    res.writeHead(429); // Thiết lập mã trạng thái 429
    res.end(
      JSON.stringify({
        status: 429,
        error: "TOO_MANY_ATTEMPTS",
        message: "Bạn đã nhập OTP quá nhiều lần. Vui lòng thử lại sau 5 phút.",
      })
    );
  },
});

module.exports = verifyOtpLimiter;
