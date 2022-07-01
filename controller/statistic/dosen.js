const DB = require("../../config/db/oracle");
const DosenRepository = require("../../repository/statistic/dosen");
const { body, param, query, validationResult } = require("express-validator");

module.exports = {
  validasi: (method) => {
    switch (method) {
    }
  },
  overallScore: async (req, res) => {
    const id_kuliah = req.query.id_kuliah;
    const conn = await DB.getConnection();
    const score = await DosenRepository.rataRataNilai(conn, id_kuliah);
    DB.closeConnection(conn);
    return res.status(200).json(score);
  },
  submittedAssignment: async (req, res) => {
    const id = req.query.id;
    const id_kuliah = req.query.id_kuliah;
    const conn = await DB.getConnection();
    const submit = await DosenRepository.ambilTugasTerkumpul(conn, id, id_kuliah);
    DB.closeConnection(conn);
    return res.status(200).json(submit);
  },
  totalAssignment: async (req, res) => {
    const id = req.query.id;
    const id_kuliah = req.query.id_kuliah;
    const conn = await DB.getConnection();
    const total = await DosenRepository.ambilSemuaTugas(conn, id, id_kuliah);
    DB.closeConnection(conn);
    return res.status(200).json(total);
  },
  underperformStudent: async (req, res) => {
    // const id = req.query.id;
    const id_kuliah = req.query.id_kuliah;
    const jenis_schema = req.query.jenis_schema;
    const conn = await DB.getConnection();
    const total = await DosenRepository.ambilMahasiswaAktifitasRendah(conn, id_kuliah, jenis_schema);
    DB.closeConnection(conn);
    return res.status(200).json(total);
  },
  totalStudent: async (req, res) => {
    // const id = req.query.id;
    const id_kuliah = req.query.id_kuliah;
    const conn = await DB.getConnection();
    const total = await DosenRepository.ambilTotalMahasiswa(conn, id_kuliah);
    DB.closeConnection(conn);
    return res.status(200).json(total);
  },
  chartScore: async (req, res) => {
    const id = req.query.id;
    const id_kuliah = req.query.id_kuliah;
    const conn = await DB.getConnection();
    const data = await DosenRepository.dataGrafikScore(conn, id, id_kuliah);
    DB.closeConnection(conn);
    return res.status(200).json(data);
  },
  chartActivity: async (req, res) => {
    // const id = req.query.id;
    const id_kuliah = req.query.id_kuliah;
    const jenis_schema = req.query.jenis_schema;
    const conn = await DB.getConnection();
    const data = await DosenRepository.dataGrafikActivity(conn, id_kuliah, jenis_schema);
    DB.closeConnection(conn);
    return res.status(200).json(data);
  },
};
