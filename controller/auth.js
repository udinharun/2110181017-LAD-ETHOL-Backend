const DB = require("../config/db/oracle");
const PegawaiRepository = require("../repository/pegawai");
const MahasiswaRepository = require("../repository/statistic/mahasiswa");
const { HAK_AKSES, ELISTA, ADMIN_ETHOL } = require("../helper/konstanta");
const { body, validationResult, query } = require("express-validator");
const { formatNamaPegawai } = require("../helper/format");
const jwt = require("jsonwebtoken");
const konstanta = require("../helper/konstanta");
const axios = require("axios");

const kategoriAkses = function (staff) {
  let hakAkses;
  HAK_AKSES.forEach((item) => {
    if (item.staff === staff) {
      hakAkses = item.hakAkses;
    }
  });
  return hakAkses;
};

const cekElista = function (email) {
  let nomor;
  ELISTA.forEach((item) => {
    if (item.email === email) {
      nomor = item.nomor;
    }
  });
  return nomor;
};

const cekAdmin = function (email) {
  return ADMIN_ETHOL.includes(email);
};

module.exports = {
  validasi: (method) => {
    switch (method) {
      case "generateToken":
        return [
          body("nomor").isNumeric(),
          body("nama").isEmpty(),
          body("nipnrp").isEmpty(),
          body("hakAkses").isEmpty(),
        ];
    }
  },
  validasiToken: async (req, res) => {
    return res.status(200).json(req.user);
  },
  generateToken: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    return res.status(200).json({
      sukses: true,
      pesan: "Token berhasil digenerate",
      token: jwt.sign({ ...req.body }, process.env.SECRET_KEY),
    });
  },
  checkAuth: async (req, res) => {
    const { email, nrp, nip } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const elista = cekElista(email);
    let result;
    const hakAkses = [];
    if (elista) {
      const pegawai = await PegawaiRepository.ambilBerdasarkanNomor(
        conn,
        elista
      );
      if (cekAdmin(email)) {
        hakAkses.push("admin");
        hakAkses.push("baak");
      }
      result = {
        nomor: pegawai.nomor,
        nipnrp: pegawai.nip,
        nama: formatNamaPegawai(
          pegawai.gelarDpn,
          pegawai.nama,
          pegawai.gelarBlk
        ),
        hakAkses,
      };
    } else if (nip) {
      const pegawai = await PegawaiRepository.ambilBerdasarkanNip(conn, nip);
      if (pegawai.nomor != null) {
        const hakAkses = [];
        hakAkses.push(kategoriAkses(pegawai.staff));
        if (cekAdmin(email)) {
          hakAkses.push("admin");
          hakAkses.push("baak");
        }
        const kaprodi = await PegawaiRepository.kaprodi(conn, pegawai.nomor);
        if (kaprodi) {
          hakAkses.push("kaprodi");
        }
        result = {
          nomor: pegawai.nomor,
          nipnrp: pegawai.nip,
          nama: formatNamaPegawai(
            pegawai.gelarDpn,
            pegawai.nama,
            pegawai.gelarBlk
          ),
          hakAkses,
        };
      } else {
        result = {
          nomor: null,
        };
      }
    } else if (nrp) {
      const mahasiswa = await MahasiswaRepository.ambilBerdasarkanNrp(
        conn,
        nrp
      );
      if (mahasiswa.nomor != null) {
        result = {
          nomor: mahasiswa.nomor,
          nipnrp: mahasiswa.nrp,
          nama: mahasiswa.nama,
          hakAkses: ["mahasiswa"],
        };
      } else {
        result = {
          nomor: null,
        };
      }
    }
    let tokennya = null;

    if (result.nomor != null) {
      tokennya = jwt.sign(result, process.env.SECRET_KEY);
    }
    DB.closeConnection(conn);
    return res.status(200).json({ ...result, token: tokennya });
  },
};
