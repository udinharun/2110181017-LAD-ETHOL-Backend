const moment = require("moment-timezone");
moment.locale("id");
moment.tz.setDefault("Asia/Jakarta");
module.exports = {
  getTglSekarang(format = "DD-MM-YYYY") {
    /**
     * @format
     * DD-MM-YYYY (17-08-1945)
     * YYYY-MM-DD (1945-08-17)
     * DD MMMM YYYY (17 Agustus 1945)
     * dddd, DD MMMM YYYY (Jumat, 17 Agustus, 1945)
     */
    let tglSekarang = new Date();
    let tgl = moment(tglSekarang).tz("Asia/Jakarta").format(format);
    return tgl;
  },
  formatTgl(tgl, format_lama, format_baru) {
    /**
     * @tgl
     * misal : 1945-08-17
     * @format_lama
     * misal : YYYY-MM-DD
     * @format_baru
     * DD-MM-YYYY (17-08-1945)
     * YYYY-MM-DD (1945-08-17)
     * DD MMMM YYYY (17 Agustus 1945)
     * dddd, DD MMMM YYYY (Jumat, 17 Agustus, 1945)
     */
    tanggal = moment(tgl, format_lama).tz("Asia/Jakarta").format(format_baru);
    return tanggal;
  },
  getWaktuSekarang(format = "DD-MM-YYYY HH:mm:ss") {
    /**
     * @format
     * DD-MM-YYYY HH:mm:ss (17-08-1945 08:30:00)
     * YYYY-MM-DD HH:mm:ss (1945-08-17 08:30:00)
     * DD MMMM YYYY - HH:mm (17 Agustus 1945 - 08:30)
     * dddd, DD MMMM YYYY - HH:mm (Jumat, 17 Agustus 1945 - 08:30)
     */

    let waktuSekarang = new Date();
    let waktu = moment(waktuSekarang).tz("Asia/Jakarta").format(format);
    return waktu;
  },
  formatWaktu(waktu_params, format_lama, format_baru) {
    /**
     * @waktu_params
     * misal : 1945-08-17 18:30
     * @format_lama
     * misal : YYYY-MM-DD HH:mm
     * @format_baru
     * DD-MM-YYYY HH:mm:ss (17-08-1945 08:30:00)
     * YYYY-MM-DD HH:mm:ss (1945-08-17 08:30:00)
     * DD MMMM YYYY - HH:mm (17 Agustus 1945 - 08:30)
     * dddd, DD MMMM YYYY - HH:mm (Jumat, 17 Agustus 1945 - 08:30)
     */
    waktu = moment(waktu_params, format_lama)
      .tz("Asia/Jakarta")
      .format(format_baru);
    return waktu;
  },
  selisihMenit(awal, akhir) {
    try {
      return Math.abs(new Date(akhir) - new Date(awal)) / 60000;
    } catch (err) {
      return null;
    }
  },
};
