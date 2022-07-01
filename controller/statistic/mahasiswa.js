const DB = require("../../config/db/oracle");
const MahasiswaRepository = require("../../repository/statistic/mahasiswa");
const DosenRepository = require("../../repository/statistic/dosen");
const { body, param, query, validationResult } = require("express-validator");

function formatTanggal(tanggal) {
  var item = tanggal.split("-");
  return new Date(item[2], item[1] - 1, item[0]);
}

module.exports = {
  validasi: (method) => {
    switch (method) {
    }
  },
  submittedAssignment: async (req, res) => {
    const id = req.query.id;
    const id_kuliah = req.query.id_kuliah;
    const conn = await DB.getConnection();
    const data = await MahasiswaRepository.ambilTugasTerkumpul(conn, id, id_kuliah);
    DB.closeConnection(conn);
    return res.status(200).json(data);
  },
  totalAssignment: async (req, res) => {
    const id = req.query.id;
    const id_kuliah = req.query.id_kuliah;
    const conn = await DB.getConnection();
    const data = await MahasiswaRepository.ambilSemuaTugas(conn, id, id_kuliah);
    DB.closeConnection(conn);
    return res.status(200).json(data);
  },
  overallScore: async (req, res) => {
    const id = req.query.id;
    const id_kuliah = req.query.id_kuliah;
    const conn = await DB.getConnection();
    const data = await MahasiswaRepository.rataRataNilai(conn, id, id_kuliah);
    DB.closeConnection(conn);
    return res.status(200).json(data);
  },
  overallActivity: async (req, res) => {
    const id = req.query.id;
    const id_kuliah = req.query.id_kuliah;
    const jenis_schema = req.query.jenis_schema;
    const conn = await DB.getConnection();
    const data = await MahasiswaRepository.ambilNilaiAktifitas(conn, id, id_kuliah, jenis_schema);
    DB.closeConnection(conn);
    return res.status(200).json(data);
  },
  detailTugasMahasiswa: async (req, res) => {
    const id = req.query.id;
    const id_kuliah = req.query.id_kuliah;
    const conn = await DB.getConnection();
    const data = await MahasiswaRepository.ambilDetailTugas(conn, id, id_kuliah);
    let totalOk = 0;
    let totalTerlambat = 0;

    if (data != null){
      data.tugas.forEach(item => {
        if ((formatTanggal(item.mengumpulkan) > formatTanggal(item.tenggat)) || item.mengumpulkan == '') {
          item.status = 'TERLAMBAT';
          totalTerlambat += 1;
        } 
        else {
          item.status = 'OK';
          totalOk += 1;
        }
      });

      data.status = [totalOk, totalTerlambat];
    }
    DB.closeConnection(conn);
    return res.status(200).json(data);
  },
  detailAbsenMahasiswa: async (req, res) => {
    const id = req.query.id;
    const id_kuliah = req.query.id_kuliah;
    const conn = await DB.getConnection();
    const data = await MahasiswaRepository.ambilDetailAbsen(conn, id, id_kuliah);
    let totalOk = 0;
    let totalTerlambat = 0;
    let totalTidakHadir = 0;

    if (data != null){
      data.absen.forEach(item => {
        if (item.absen != '') {
          let dibuka = item.dibuka.split(':');
          let absen = item.absen.split(':');
          let dibukaMinutes = (+dibuka[0]) * 60 + (+dibuka[1])
          let absenMinutes = (+absen[0]) * 60 + (+absen[1])
          
          if ((absenMinutes - dibukaMinutes) > 15) {
            item.status = 'TERLAMBAT';
            totalTerlambat += 1;
          } 
          else {
            item.status = 'OK';
            totalOk += 1;
          }
        }
        else {
          item.status = 'TIDAK HADIR';
          totalTidakHadir += 1;
        }
      });

      data.status = [totalOk, totalTerlambat, totalTidakHadir];
    }
    DB.closeConnection(conn);
    return res.status(200).json(data);
  },
  daftarMatkul: async (req, res) => {
    const id = req.query.id;
    const conn = await DB.getConnection();
    const data = await MahasiswaRepository.ambilSemuaMataKuliah(conn, id);
    DB.closeConnection(conn);
    return res.status(200).json(data);
  },
  grafikNilai: async (req, res) => {
    const id = req.query.id;
    const id_kuliah = req.query.id_kuliah;
    const conn = await DB.getConnection();
    const data = await MahasiswaRepository.dataGrafikNilai(conn, id, id_kuliah);
    DB.closeConnection(conn);
    return res.status(200).json(data);
  },
  grafikNilaiKelas: async (req, res) => {
    const id = req.query.id;
    const id_kuliah = req.query.id_kuliah;
    const conn = await DB.getConnection();
    const data = await DosenRepository.ambilTotalMahasiswa(conn, id_kuliah);
    const score = await DosenRepository.rataRataNilai(conn, id_kuliah);
    let arrayScore = [];
    let array = [];
    let nilai = 0
    let nilaiTertinggi = 0;
    let nilaiTerendah = 0;
    let nilaiRatarata = 0;
    
    if (data != null || data != undefined) {
      for (const item of data.students) {
        arrayScore.push(item.score);

        if (item.id == id) {
          nilai = item.score
        }
      }
      nilaiTertinggi = Math.max(...arrayScore);
      nilaiTerendah = Math.min(...arrayScore);
    }
    
    if (score != null || score != undefined) {
      nilaiRatarata = score.score
    }

    array.push({
      nilai: nilai,
      nilaiTertinggi: nilaiTertinggi.toFixed(2),
      nilaiTerendah: nilaiTerendah.toFixed(2),
      nilaiRatarata: nilaiRatarata.toFixed(2),
    })

    DB.closeConnection(conn);
    return res.status(200).json(array);
  },
};
