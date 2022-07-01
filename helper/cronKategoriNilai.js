const DB = require("../config/db/oracle");
const cron = require("node-cron");
const HARI = 1000 * 60 * 60 * 24;
const MENIT = 1000 * 60;

function selisihTanggalHari(a, b) {
  var tgl1 = new Date(a);
  var tgl2 = new Date(b);

  return Math.floor((tgl2.getTime() - tgl1.getTime()) / HARI);
}

function selisihTanggalMenit(a, b) {
  var tgl1 = new Date(a);
  var tgl2 = new Date(b);

  return Math.floor((tgl2.getTime() - tgl1.getTime()) / MENIT);
}

function kategoriNilai(nilai) {
  if (nilai == 3)
    return 'High';
  else if (nilai == 2)
    return 'Medium';
  else
    return 'Low';
}

exports.update_kategori_nilai = function () {
    // cron.schedule('28 12 * * *', async () => {
    cron.schedule('1 1-3 1 * * *', async () => {
        try {
            const conn = await DB.getConnection();
            const daftarMahasiswa = await conn
                .execute(`SELECT M.NOMOR ID, K.NOMOR ID_KULIAH, K.JENIS_SCHEMA JENIS_SCHEMA
                          FROM MAHASISWA M, MAHASISWA_SEMESTER MS, KULIAH K
                          WHERE 
                            M.NOMOR = MS.MAHASISWA AND 
                            K.NOMOR = MS.KULIAH 
                          ORDER BY ID`)
                .then((res) => {
                if (res.rows.length) {
                    return {
                        total: res.rows.length,
                        mahasiswa: res.rows.map((item) => {
                            {
                                return {
                                    id: item[0],
                                    id_kuliah: item[1],
                                    jenis_schema: item[2],
                                }
                            }
                        }),
                    };
                } else {
                    return {
                        total: null,
                        mahasiswa: null,
                        jenis_schema: null,
                    };
                }
                })
                .catch((err) => {
                    console.log("mahasiswa ambilSemuaMahasiswaKuliah : ", err);
                });
            
            for (let index = 0; index < daftarMahasiswa.total; index++) {
                var item = daftarMahasiswa.mahasiswa[index]
                var id = item.id;
                var id_kuliah = item.id_kuliah;
                var jenis_schema = item.jenis_schema;
                var nilai_tugas;
                var nilai_absen;
                var nilai_total;

                var data_tugas = await conn
                    .execute(`SELECT 
                                TO_CHAR(T.TANGGAL_ENTRI, 'YYYY-MM-DD') MULAI, 
                                TO_CHAR(T.TANGGAL, 'YYYY-MM-DD') SELESAI, 
                                TO_CHAR(TM.TANGGAL_KOREKSI, 'YYYY-MM-DD') ENTRI
                              FROM 
                                TUGAS T, TUGAS_MHS TM, MAHASISWA M
                              WHERE 
                                T.NOMOR = TM.TUGAS AND 
                                M.NOMOR = TM.MAHASISWA AND 
                                T.KULIAH = :0 AND 
                                M.NOMOR = :1`, [id_kuliah, id])
                    .then((res) => {
                        if (res.rows.length) {
                            return {
                            total: res.rows.length,
                            assignment: res.rows.map((item) => {
                                {
                                    return {
                                        mulai: item[0],
                                        selesai: item[1],
                                        entri: item[2],
                                    }
                                }
                            }),
                            };
                        } else {
                            return {
                                total: null,
                                assignment: null,
                            };
                        }
                    })
                    .catch((err) => {
                        console.log("mahasiswa ambilSemuaTugas : ", err);
                        return {
                            total: null,
                            assignment: null,
                        };
                    });
                var data_absen = await conn
                    .execute(`SELECT PD.TANGGAL BUKA_ABSEN, PM.TANGGAL ABSEN, PM.MAHASISWA
                              FROM PRESENSI_DOSEN PD, PRESENSI_MAHASISWA PM
                              WHERE 
                                PD.KEY = PM.KEY AND
                                PM.JENIS_SCHEMA = :0 AND 
                                PM.KULIAH = :1 AND 
                                PM.MAHASISWA = :2`, [jenis_schema, id_kuliah, id])
                    .then((res) => {
                        if (res.rows.length) {
                            return {
                                total: res.rows.length,
                                absen: res.rows.map((item) => {
                                    {
                                        return {
                                            mahasiswa: item[2],
                                            buka_absen: item[0],
                                            buka: item[1],
                                        }
                                    }
                                }),
                            };
                        } else {
                            return {
                                absen: null,
                            };
                        }
                    })
                    .catch((err) => {
                        console.log("mahasiswa ambilRiwayatAbsen : ", err);
                        return {
                            absen: null,
                        };
                    });

                // Menghitung bobot nilai tugas
                if (data_tugas.assignment != null) {
                    var bobot = 0;
                    data_tugas.assignment.forEach(item => {
                        var total_waktu = selisihTanggalHari(item.mulai, item.selesai);
                        var total_waktu_submit =  selisihTanggalHari(item.mulai, item.entri);

                        if (total_waktu_submit <= Math.round(total_waktu * 0.4)) {
                            bobot += 3;
                        } else if (total_waktu_submit > Math.round(total_waktu * 0.4) && total_waktu_submit <= total_waktu) {
                            bobot += 2;
                        } else {
                            bobot += 1;
                        }
                    });
                    nilai_tugas = Math.round(bobot / data_tugas.total);
                } else {
                    nilai_tugas = 1;
                }
            
                // Menghitung bobot nilai absen
                if (data_absen.absen != null) {
                    var bobot = 0;
                    data_absen.absen.forEach(item => {
                        var waktu = selisihTanggalMenit(item.buka_absen, item.buka);
                        if (waktu <= 15) {
                            bobot += 3;
                        } else if (waktu > 15 && waktu <= 30) {
                            bobot += 2;
                        } else {
                            bobot += 1;
                        }
                    });
                    nilai_absen = Math.round(bobot / data_absen.total);
                } else {
                    nilai_absen = 1;
                }

                nilai_total = Math.round((nilai_absen + nilai_tugas) / 2);
                
                // Ubah bobot menjaadi kategori nilai
                nilai_tugas = kategoriNilai(nilai_tugas); 
                nilai_absen = kategoriNilai(nilai_absen); 
                nilai_total = kategoriNilai(nilai_total);

                const cek = await conn
                    .execute(`SELECT * 
                              FROM MAHASISWA_KATEGORI_NILAI 
                              WHERE 
                                MAHASISWA = :0 AND 
                                KULIAH = :1 AND
                                JENIS_SCHEMA = :2`, [id, id_kuliah, jenis_schema]
                            )
                    .then((res) => {
                        if (res.rows.length) {
                            return {
                                isUpdate: true,
                            };
                        } else {
                            return {
                                isUpdate: false,
                            };
                        }
                    })
                    .catch((err) => {
                        console.log("mahasiswa updateKategoriNilai : ", err);
                        return {
                            isUpdate: null,
                        };
                    });
                if (cek.isUpdate) {
                    let kategori_nilai = await conn
                        .execute(`UPDATE MAHASISWA_KATEGORI_NILAI 
                                SET 
                                    ABSEN = :0, 
                                    TUGAS = :1, 
                                    TOTAL = :2 
                                WHERE
                                    MAHASISWA = :3 AND 
                                    KULIAH = :4 AND 
                                    JENIS_SCHEMA = :5`, 
                                [nilai_absen, nilai_tugas, nilai_total, id, id_kuliah, jenis_schema], 
                                { autoCommit: true })
                        .then((res) => {
                            console.log(res);
                        })
                        .catch((err) => {
                            console.log("mahasiswa perbaruiKategoriNilai : ", err);
                        });
                } else {
                    let kategori_nilai = await conn
                        .execute(`INSERT INTO MAHASISWA_KATEGORI_NILAI(NOMOR, MAHASISWA, ABSEN, TUGAS, TOTAL, KULIAH, JENIS_SCHEMA)
                                VALUES (NOMOR_SEQ.NEXTVAL, :0, :1, :2, :3, :4, :5)`, 
                                [id, nilai_absen, nilai_tugas, nilai_total, id_kuliah, jenis_schema], 
                                { autoCommit: true })
                        .then((res) => {
                            console.log(res);
                        })
                        .catch((err) => {
                            console.log("mahasiswa simpanKategoriNilai : ", err);
                        });
                }
            }

            DB.closeConnection(conn);
        } catch (err) {
            console.log('Error updateActivity : ', err)
        } 
    });
}