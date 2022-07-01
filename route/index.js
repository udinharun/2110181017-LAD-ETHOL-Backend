const express = require("express");
const auth = require("./modules/auth");
const conferenceLainnya = require("./modules/conference-lainnya");
const hari = require("./modules/hari");
const libur = require("./modules/libur");
const pegawai = require("./modules/pegawai");
const program = require("./modules/program");
const mahasiswa = require("./modules/statistic/mahasiswa");
const dosen = require("./modules/statistic/dosen");

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({
    message: "Selamat datang di ETHOL REST-API TA ",
  });
});
router.use("/auth", auth);
router.use("/conference-lainnya", conferenceLainnya);
router.use("/hari", hari);
router.use("/libur", libur);
router.use("/pegawai", pegawai);
router.use("/program", program);
router.use("/mahasiswa", mahasiswa);
router.use("/dosen", dosen);

module.exports = router;
