const jwt = require("jsonwebtoken");
const { loginAccessToken } = require("../utility/jwtToken");

const userAuth = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.session.result = decoded;
    next();
  } catch (error) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        console.log(error);
        res.redirect("/user/logout");
        return;
      }
      const decoded = jwt.verify(
        refreshToken,
        this.process.env.REFRESH_TOKEN_SECRET
      );
      const newAccessToken = await loginAccessToken(decoded);
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      req.session.result = decoded;
      next();
    } catch (error) {
      console.log(error);
      res.redirect("/user/logout");
    }
  }
};

module.exports = userAuth;
