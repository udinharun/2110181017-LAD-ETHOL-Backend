const express = require("express");
const controller = require("../../controller/auth");
const authMiddleware = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/admin");
const router = express.Router();

router.post("/check", controller.checkAuth);
router.get("/validasi-token", authMiddleware, controller.validasiToken);

module.exports = router;
