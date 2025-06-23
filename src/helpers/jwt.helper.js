const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Token = require("../models/token");
const User = require("../models/user");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;

// Tạo access token
const generateAccessToken = (user, secretSignature, tokenLife) => {
  return new Promise((resolve, reject) => {
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };
    jwt.sign(
      { data: userData },
      secretSignature,
      {
        algorithm: "HS256",
        expiresIn: tokenLife,
      },
      (error, token) => {
        if (error) return reject(error);
        resolve(token);
      }
    );
  });
};

const generateAccessTokenByRefreshToken = async (refreshToken) => {
  console.log("dcmmmm");

  if (!refreshToken) return null;

  try {
    console.log("Đẫ vào đây");

    const tokenRecord = await Token.query()
      .where({ refresh_token: refreshToken })
      .andWhere("expires_at", ">", new Date())
      .first();

    if (!tokenRecord) return null;

    const user = await User.query().where({ id: tokenRecord.user_id }).first();
    if (!user) return null;

    const newAccessToken = await generateAccessToken(
      user,
      accessTokenSecret,
      accessTokenLife
    );

    return {
      accessToken: newAccessToken,
    };
  } catch (err) {
    console.log(err);
    return null;
  }
};

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex"); // 128 ký tự hex
};

// Hàm xác thực token
const verifyToken = (token, secretKey) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (error, decoded) => {
      if (error) return reject(error);
      resolve(decoded);
    });
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  generateAccessTokenByRefreshToken,
};
