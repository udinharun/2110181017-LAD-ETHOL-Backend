const express = require("express");
const controller = require("../../../controller/statistic/dosen");
const router = express.Router();

router.get("/overall/score", controller.overallScore);
router.get("/submit/assignment", controller.submittedAssignment);
router.get("/total/assignment", controller.totalAssignment);
router.get("/underperform/student", controller.underperformStudent);
router.get("/total/student", controller.totalStudent);

// Chart
router.get("/chart/data/score", controller.chartScore);
router.get("/chart/data/activity", controller.chartActivity);


module.exports = router;
