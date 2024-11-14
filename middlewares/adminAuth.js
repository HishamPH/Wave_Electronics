const jwt = require("jsonwebtoken");
const { loginAccessToken } = require("../utility/jwtToken");

const adminAuth = async (req, res, next) => {
  try {
    const accessToken = req.cookies.adminAccessToken;
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const { _id, name, email } = decoded;
    if (!req.session.admin) {
      req.session.admin = { _id, name, email };
      res.locals.adminname = name;
    }

    next();
  } catch (error) {
    try {
      const refreshToken = req.cookies.adminRefreshToken;
      if (!refreshToken) {
        console.log(error);
        res.redirect("/admin/logout");
        return;
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      console.log("the refresh part for admin side", decoded);
      const { _id, name, email } = decoded;
      if (!req.session.admin) {
        req.session.admin = { _id, name, email };
        res.locals.adminname = name;
      }
      const newAccessToken = await loginAccessToken({ _id, name, email });
      res.cookie("adminAccessToken", newAccessToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      next();
    } catch (error) {
      console.log(error);
      res.redirect("/admin/logout");
    }
  }
};

module.exports = adminAuth;
