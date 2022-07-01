const express = require("express");
const controller = require("../../../controller/statistic/mahasiswa");
const router = express.Router();

router.get("/submit/assignment", controller.submittedAssignment);
router.get("/total/assignment", controller.totalAssignment);
router.get("/overall/score", controller.overallScore);
router.get("/overall/activity", controller.overallActivity);
router.get("/daftar/matkul", controller.daftarMatkul);
router.get("/detail/tugas", controller.detailTugasMahasiswa);
router.get("/detail/absen", controller.detailAbsenMahasiswa);

// Grafik
router.get("/chart/data/score/personal", controller.grafikNilai);
router.get("/chart/data/score/class", controller.grafikNilaiKelas);

module.exports = router;
