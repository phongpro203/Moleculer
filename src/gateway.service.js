const ApiGateway = require("moleculer-web");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const jwtHelper = require("./helpers/jwt.helper");
const { Errors } = require("moleculer-web");
const verifyOtpLimiter = require("./helpers/otpLimiter");

module.exports = {
  name: "gateway",
  mixins: [ApiGateway],
  settings: {
    use: [cookieParser()],
    port: 3000,
    routes: [
      {
        authorization: true,
        path: "/api/user",

        aliases: {
          "GET /": "user.getAll",
          "POST /": "user.create",
          "PUT /:id": "user.update",
          "DELETE /:id": "user.delete",
          "POST /send-mail": "user.sendMailScheduler",
        },
        cors: {
          origin: "http://localhost:5173",
          credentials: true,
        },
        bodyParsers: {
          json: true,
        },
      },
      {
        path: "/api/cinema",

        aliases: {
          "GET /movie": "movie.getAll",
          "GET /showtime": "showtime.getAll",
          "GET /room": "room.getAll",
          "GET /booking/:id": "booking.getById",
          "POST /room": "room.createRoom",
          "POST /booking": "booking.create",
          "POST /showtime": "showtime.create",
        },
        cors: {
          origin: "http://localhost:5173",
          credentials: true,
        },
        bodyParsers: {
          json: true,
        },
      },
      {
        path: "/api/auth",
        aliases: {
          "POST /login": "auth.login",
          "POST /logout": "auth.logout",
          "POST /register": "auth.register",
          "POST /forgot-password": "auth.forgotPassword",
          "POST /verify-otp": [
            verifyOtpLimiter, // Áp dụng rate limiter cho endpoint verify-otp
            "auth.verifyOTP",
          ],
          "POST /reset-password": "auth.resetPassword",
          "POST /logout-other-devices": "auth.logoutOtherDevices",
          "GET /verify-email": "auth.verifyEmail",
          "GET /youtube": "auth.redirectToYoutube",
        },
        cors: {
          origin: "http://localhost:5173",
          credentials: true,
        },

        bodyParsers: {
          json: true,
        },
        onBeforeCall(ctx, route, req, res) {
          ctx.meta.cookies = req.cookies;
        },
      },
    ],
  },
  methods: {
    async authorize(ctx, route, req) {
      const cookies = req.cookies || {};
      const accessToken = cookies.accessToken;
      const refreshToken = cookies.refreshToken;
      console.log(refreshToken, "????");

      const accessSecret = process.env.ACCESS_TOKEN_SECRET;

      try {
        if (accessToken) {
          try {
            const decoded = await jwtHelper.verifyToken(
              accessToken,
              accessSecret
            );
            ctx.meta.user = decoded;

            return {
              isLogin: true,
            };
          } catch (err) {
            console.log(err);
          }
        }
        // Nếu không có accessToken hoặc hết hạn => thử dùng refreshToken
        if (refreshToken) {
          const result = await jwtHelper.generateAccessTokenByRefreshToken(
            refreshToken
          );

          if (result && result.accessToken) {
            ctx.meta.user = result.user;

            // Gửi lại access token mới qua cookie
            ctx.meta.$responseHeaders = {
              "Set-Cookie": [
                `accessToken=${result.accessToken}; HttpOnly; Path=/; Max-Age=900; SameSite=Strict`,
              ],
            };

            return [
              {
                isLogin: true,
              },
            ];
          }

          // Ném lỗi với thông điệp rõ ràng
          throw new Errors.UnAuthorizedError("INVALID_TOKEN", {
            message: "Refresh token expired or invalid",
          });
        }

        // Ném lỗi nếu không có token hợp lệ
        throw new Errors.UnAuthorizedError("NO_TOKEN", {
          message: "No valid token provided",
        });
      } catch (err) {
        // Trả về lỗi với mã và thông điệp để FE xử lý
        if (err instanceof Errors.UnAuthorizedError) {
          throw err; // Giữ nguyên lỗi UnAuthorizedError
        }

        // Xử lý các lỗi khác
        throw new Errors.UnAuthorizedError("UNAUTHORIZED", {
          message: "Unauthorized",
          error: err.message,
        });
      }
    },
  },
};
