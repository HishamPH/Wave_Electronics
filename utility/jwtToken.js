const jwt = require("jsonwebtoken");

module.exports = {
  loginAccessToken: async (user) => {
    try {
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "30min",
      });
      if (token) return token;
      return null;
    } catch (err) {
      console.log(err);
      return null;
    }
  },

  loginRefreshToken: async (user) => {
    try {
      const token = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "30d",
      });
      if (token) return token;
      return null;
    } catch (err) {
      console.log(err);
      return null;
    }
  },
};
