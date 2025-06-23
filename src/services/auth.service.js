const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const redis = require("../lib/redis");
const jwtHelper = require("../helpers/jwt.helper");
const validateUser = require("../validator/userValidator");
const User = require("../models/user");
const Token = require("../models/token");
const { ValidationError } = require("moleculer").Errors;

module.exports = {
  name: "auth",
  actions: {
    login: {
      params: {
        email: "string",
        password: "string",
      },
      async handler(ctx) {
        const { email, password } = ctx.params;
        const user = await User.query().findOne({ email, password });
        if (!user) {
          ctx.meta.$statusCode = 401;
          return { message: "Sai email hoặc mật khẩu" };
        }
        if (!user.verify) {
          ctx.meta.$statusCode = 403;
          return { message: "Tài khoản chưa xác minh" };
        }

        const accessToken = await jwtHelper.generateAccessToken(
          user,
          process.env.ACCESS_TOKEN_SECRET,
          process.env.ACCESS_TOKEN_LIFE
        );
        const refreshToken = jwtHelper.generateRefreshToken();
        const expiresAt = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString();

        ctx.meta.$responseHeaders = {
          "Set-Cookie": [
            `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=1800; SameSite=Lax`,
            `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`,
          ],
        };
        await Token.query().insert({
          user_id: user.id,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: expiresAt,
        });

        return { accessToken, refreshToken };
      },
    },

    logout: {
      async handler(ctx) {
        console.log(ctx.meta.cookies, 21321);

        const refreshToken = ctx.meta?.cookies?.refreshToken;
        console.log("refresh", refreshToken);

        await Token.query().delete().where({ refresh_token: refreshToken });
        ctx.meta.$responseHeaders = {
          "Set-Cookie": [
            "accessToken=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict",
            "refreshToken=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict",
          ],
        };
        return { message: "Logged out successfully." };
      },
    },

    register: {
      params: {
        email: "string",
        password: "string",
        ten: "string",
      },
      async handler(ctx) {
        let { email, password, ten } = ctx.params;
        email = email.toLowerCase();

        const validation = validateUser({ email, password, ten });
        if (validation !== true) throw new ValidationError("Validation failed");

        const existingUser = await User.query().findOne({ email });
        if (existingUser) throw new Error("Email đã được sử dụng");

        await User.query().insert({ email, password, ten });

        const emailToken = jwt.sign({ email }, process.env.EMAIL_SECRET, {
          expiresIn: "1h",
        });
        const url = `http://localhost:3000/api/auth/verify-email?token=${emailToken}`;

        ctx.call("email.sendVerifyEmail", { email, url });

        return { message: "Tạo tài khoản thành công" };
      },
    },

    verifyOTP: {
      params: {
        email: "string",
        otp: "number",
      },
      async handler(ctx) {
        const { email, otp } = ctx.params;
        const storedOtp = await redis.get(`otp:${email}`);
        console.log(storedOtp);

        if (!storedOtp) throw new Error("OTP đã hết hạn hoặc không tồn tại");
        if (storedOtp != otp) throw new Error("OTP không chính xác");
        await redis.del(`otp:${email}`);
        await redis.set(`otp-verified:${email}`, true, "EX", 300);
        return { message: "Xác minh OTP thành công" };
      },
    },

    forgotPassword: {
      params: {
        email: "string",
      },
      async handler(ctx) {
        const { email } = ctx.params;
        const user = await User.query().findOne({ email });
        if (!user) {
          ctx.meta.$statusCode = 404;
          return { message: "Tài khoản không tồn tại" };
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        await redis.set(`otp:${email}`, otp, "EX", 300);

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"Xác thực tài khoản" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "OTP lấy lại mật khẩu",
          html: `Đây là mã OTP của bạn : ${otp}`,
        });

        return { message: "Gửi email thành công" };
      },
    },

    resetPassword: {
      params: {
        email: "string",
        password: "string",
      },
      async handler(ctx) {
        const { email, password } = ctx.params;
        const verified = await redis.get(`otp-verified:${email}`);
        if (!verified) throw new Error("Bạn chưa xác thực OTP");

        const count = await User.query().patch({ password }).where({ email });
        if (count === 0) throw new Error("User not found");
        return { message: "Đổi mật khẩu thành công" };
      },
    },

    logoutOtherDevices: {
      params: {
        email: "string",
      },
      async handler(ctx) {
        const { email } = ctx.params;
        const verified = await redis.get(`otp-verified:${email}`);
        if (!verified) throw new Error("Bạn chưa xác thực OTP");

        const user = await User.query().findOne({ email });
        if (!user) throw new Error("User not found");

        await Token.query().delete().where({ user_id: user.id });
        return { message: "Đăng xuất khỏi tất cả thiết bị thành công" };
      },
    },

    verifyEmail: {
      params: {
        token: "string",
      },
      async handler(ctx) {
        const { token } = ctx.params;
        const decoded = jwt.verify(token, process.env.EMAIL_SECRET);
        const user = await User.query().findOne({ email: decoded.email });
        if (!user) throw new Error("Tài khoản không tồn tại");

        await User.query()
          .patch({ verify: true })
          .where({ email: decoded.email });

        ctx.meta.$statusCode = 302;
        ctx.meta.$location = "http://localhost:5173/login";

        return;
      },
    },

    redirectToYoutube(ctx) {
      ctx.meta.$statusCode = 302;
      ctx.meta.$location = "https://www.youtube.com/";

      return;
    },
  },
};
