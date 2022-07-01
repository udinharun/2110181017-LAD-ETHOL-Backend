module.exports = {
  ambilBerdasarkanNrp: (conn, nrp) => {
    return conn
      .execute("select nomor, nrp, nama from mahasiswa where nrp=:0", [nrp])
      .then((res) => {
        if (res.rows.length) {
          return {
            nomor: res.rows[0][0],
            nrp: res.rows[0][1],
            nama: res.rows[0][2],
          };
        } else {
          return {
            nomor: null,
          };
        }
      })
      .catch((err) => {
        console.log("mahasiswa ambilBerdasarkanNrp : ", err);
        return {
          nomor: null,
        };
      });
  },
  ambilTugasTerkumpul: (conn, id, id_kuliah) => {
    return conn
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
  },
  ambilSemuaTugas: (conn, id, id_kuliah) => {
    return conn
      .execute(`SELECT COUNT(*) 
                FROM MAHASISWA M, MAHASISWA_SEMESTER MS, KULIAH K, TUGAS T 
                WHERE 
                  M.NOMOR = MS.MAHASISWA AND
                  MS.KULIAH = K.NOMOR AND
                  K.NOMOR = T.KULIAH AND
                  M.NOMOR = :0 AND
                  K.NOMOR = :1`, [id, id_kuliah])
      .then((res) => {
        if (res.rows.length) {
          return {
            total: res.rows[0][0],
          };
        } else {
          return {
            total: null,
          };
        }
      })
      .catch((err) => {
        console.log("mahasiswa ambilSemuaTugas : ", err);
        return {
          total: null,
        };
      });
  },
  rataRataNilai: (conn, id, id_kuliah) => {
    return conn
      .execute(`SELECT AVG(TM.NILAI)
                FROM MAHASISWA M, MAHASISWA_SEMESTER MS, KULIAH K, TUGAS T, TUGAS_MHS TM
                WHERE M.NOMOR = MS.MAHASISWA AND
                      MS.KULIAH = K.NOMOR AND
                      K.NOMOR = T.KULIAH AND
                      TM.MAHASISWA = :0 AND
                      K.NOMOR = :1`, [id, id_kuliah])
      .then((res) => {
        if (res.rows.length) {
          return {
            score: res.rows[0][0],
          };
        } else {
          return {
            score: null,
          };
        }
      })
      .catch((err) => {
        console.log("mahasiswa rataRataNilai : ", err);
        return {
          score: null,
        };
      });
  },
  ambilNilaiAktifitas: (conn, id, id_kuliah, jenis_schema) => {
    return conn
      .execute(`SELECT UPPER(MKN.TOTAL) 
                FROM MAHASISWA_KATEGORI_NILAI MKN
                WHERE 
                  MKN.MAHASISWA = :0 AND
                  MKN.KULIAH = :1 AND
                  MKN.JENIS_SCHEMA = :2`, [id, id_kuliah, jenis_schema])
      .then((res) => {
        if (res.rows.length) {
          return {
            activity: res.rows[0][0],
          };
        } else {
          return {
            activity: null,
          };
        }
      })
      .catch((err) => {
        console.log("mahasiswa ambilNilaiAktifitas : ", err);
        return {
          activity: null,
        };
      });
  },
  ambilRiwayatAbsen: (conn, id, id_kuliah) => {
    return conn
      .execute(`SELECT PD.TANGGAL BUKA_ABSEN, PM.TANGGAL ABSEN
                FROM PRESENSI_DOSEN PD, PRESENSI_MAHASISWA PM
                WHERE 
                  PD.KEY = PM.KEY AND
                  PM.JENIS_SCHEMA = 1 AND 
                  PM.KULIAH = :0 AND 
                  PM.MAHASISWA = :1`, [id_kuliah, id])
      .then((res) => {
        if (res.rows.length) {
          return {
            total: res.rows.length,
            absen: res.rows.map((item) => {
              {
                return {
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
  },
  cekKategoriNilai: (conn, id, id_kuliah, jenis_schema) => {
    return conn
      .execute(`SELECT * 
                FROM MAHASISWA_KATEGORI_NILAI 
                WHERE 
                  MAHASISWA = :0 AND 
                  KULIAH = :1 AND
                  MKN.JENIS_SCHEMA = :2`, [id, id_kuliah, jenis_schema]
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
  },
  perbaruiKategoriNilai: (conn, id, id_kuliah, tugas, absen, total, jenis_schema) => {
    return conn
      .execute(`UPDATE MAHASISWA_KATEGORI_NILAI 
                SET 
                  ABSEN = :0, 
                  TUGAS = :1, 
                  TOTAL = :2 
                WHERE 
                  MAHASISWA = :3 AND 
                  KULIAH = :4 AND
                  MKN.JENIS_SCHEMA = :5`, 
                [absen, tugas, total, id, id_kuliah, jenis_schema], 
                { autoCommit: true }
              )
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log("mahasiswa perbaruiKategoriNilai : ", err);
      });
  },
  simpanKategoriNilai: (conn, id, id_kuliah, tugas, absen, total, jenis_schema) => {
    return conn
      .execute(`INSERT INTO MAHASISWA_KATEGORI_NILAI(NOMOR, MAHASISWA, ABSEN, TUGAS, TOTAL, KULIAH, JENIS_SHEMA)
                VALUES (NOMOR_SEQ.NEXTVAL, :0, :1, :2, :3, :4, :5)`, 
                [id, absen, tugas, total, id_kuliah, jenis_schema], 
                { autoCommit: true }
              )
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log("mahasiswa simpanKategoriNilai : ", err);
      });
  },
  ambilSemuaMahasiswaKuliah: (conn) => {
    return conn
      .execute(`SELECT M.NOMOR ID, K.NOMOR ID_KULIAH
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
                }
              }
            }),
          };
        } else {
          return {
            total: null,
            mahasiswa: null,
          };
        }
      })
      .catch((err) => {
        console.log("mahasiswa ambilSemuaMahasiswaKuliah : ", err);
      });
  },
  ambilSemuaMataKuliah: (conn, id) => {
    return conn
      .execute(`SELECT M.NOMOR ID, K.NOMOR ID_MATKUL, MK.NOMOR ID_MATKUL, MK.MATAKULIAH
                FROM MAHASISWA M, MAHASISWA_SEMESTER MS, KULIAH K, MATAKULIAH MK
                WHERE 
                  M.NOMOR = MS.MAHASISWA AND 
                  K.NOMOR = MS.KULIAH AND
                  K.MATAKULIAH = MK.NOMOR AND
                  M.NOMOR = :0
                ORDER BY K.NOMOR`, [id])
      .then((res) => {
        if (res.rows.length) {
          return {
            total: res.rows.length,
            matkul: res.rows.map((item) => {
              {
                return {
                  id: item[0],
                  id_kuliah: item[1],
                  id_matkul: item[2],
                  matakuliah: item[3],
                }
              }
            }),
          };
        } else {
          return {
            total: null,
            matkul: null,
          };
        }
      })
      .catch((err) => {
        console.log("mahasiswa ambilSemuaMataKuliah : ", err);
      });
  },
  ambilDetailTugas: (conn, id, id_kuliah) => {
    return conn
      .execute(`SELECT 
                  T.JUDUL JUDUL,
                  TRUNC((T.TANGGAL_ENTRI - TO_DATE('01/11/2021', 'DD/MM/YYYY'))/7 +1) WEEK, 
                  T.TANGGAL TENGGAT,
                  TM.TANGGAL_KOREKSI MENGUMPULKAN
                FROM TUGAS T
                LEFT JOIN TUGAS_MHS TM
                ON 
                  T.NOMOR = TM.TUGAS AND                   
                  TM.MAHASISWA = :0 
                WHERE
                  T.KULIAH = :1 AND 
                  TRUNC(T.TANGGAL_ENTRI) BETWEEN TO_DATE('01/11/2021', 'DD/MM/YYYY') AND TO_DATE('20/02/2022', 'DD/MM/YYYY')
                ORDER BY 
                  WEEK`, [id, id_kuliah])
      .then((res) => {
        if(res.rows.length) {
          return {
            tugas: res.rows.map((item) => {
              let tenggat = new Date(item[2]).getDate() + "-" + (new Date(item[2]).getMonth() + 1) + "-" + new Date(item[2]).getFullYear();
              let mengumpulkan = '';
              item[3] != null ? mengumpulkan = new Date(item[3]).getDate() + "-" + (new Date(item[3]).getMonth() + 1) + "-" + new Date(item[3]).getFullYear() : mengumpulkan = '';

              return {
                judul: item[0],
                minggu: item[1],
                tenggat: tenggat,
                mengumpulkan: mengumpulkan,
              }
            })
          }
        }
        else {
          return {
            tugas: null,
          }
        }   
      })
      .catch((err) => {
        console.log('dosen ambilDetailTugas : ', err);
        return {
          tugas: null,
        };
      })
  },
  ambilDetailAbsen: (conn, id, id_kuliah) => {
    return conn
      .execute(`SELECT 
                  TRUNC((PD.TANGGAL - TO_DATE('01/11/2021', 'DD/MM/YYYY'))/7 + 1) WEEK, 
                  PD.TANGGAL DIBUKA,
                  PM.TANGGAL ABSENSI
                FROM PRESENSI_DOSEN PD 
                LEFT JOIN PRESENSI_MAHASISWA PM 
                ON 
                  PD.KEY = PM.KEY AND               
                  PM.JENIS_SCHEMA = 1 AND 
                  PM.MAHASISWA = :0 AND
                  PM.KULIAH = :1 AND 
                  TRUNC(PD.TANGGAL) BETWEEN TO_DATE('01/11/2021', 'DD/MM/YYYY') AND TO_DATE('20/02/2022', 'DD/MM/YYYY')
                ORDER BY 
                  WEEK`, [id, id_kuliah])
      .then((res) => {
        if(res.rows.length) {
          return {
            absen: res.rows.map((item) => {
              let dibuka = ("0" + new Date(item[1]).getHours()).slice(-2) + ":" + ("0" + new Date(item[1]).getMinutes()).slice(-2);
              let absen = '';
              item[2] != null ? absen = ("0" + new Date(item[2]).getHours()).slice(-2) + ":" + ("0" + new Date(item[2]).getMinutes()).slice(-2) : absen = '';

              return {
                minggu: item[0],
                dibuka: dibuka,
                absen: absen,
              }
            })
          }
        }
        else {
          return {
            absen: null,
          }
        }        
      })
      .catch((err) => {
        console.log('dosen ambilDetailAbsen : ', err);
        return {
          absen: null,
        };
      })
  },
  dataGrafikNilai: (conn, id, id_kuliah) => {
    return conn
      .execute(`SELECT 
                  TRUNC((TM.TANGGAL_KOREKSI - TO_DATE('01/11/2021', 'DD/MM/YYYY'))/7 +1) WEEK, 
                  TM.NILAI NILAI
                FROM TUGAS_MHS TM, TUGAS T, KULIAH K
                WHERE 
                  T.NOMOR = TM.TUGAS AND
                  K.NOMOR = T.KULIAH AND
                  T.KULIAH = :0 AND 
                  TM.MAHASISWA = :1 AND
                  TRUNC(TM.TANGGAL_KOREKSI) BETWEEN TO_DATE('01/11/2021', 'DD/MM/YYYY') AND TO_DATE('20/02/2022', 'DD/MM/YYYY')
                ORDER BY 
                  WEEK`, [id_kuliah, id])
      .then((res) => {
        let data = [];
        let score;
        for (let i = 1; i <= 16; i++) {
          {
            for (const item of res.rows) {
              if (item[0] == i){
                score = item[1];
                item.shift();
                break;
              } else {
                score = 0;
              } 
            }
            data.push({
              week: i,
              score: score.toFixed(2),
            })
          }           
        }
        
        return { data: data }          
      })
      .catch((err) => {
        console.log('mahasiswa dataGrafikNilai : ', err);
        return {
          data: null,
        };
      })
  },
  dataGrafikNilaiKelas: (conn, id, id_kuliah) => {
    return conn
      .execute(`SELECT 
                  TRUNC((TM.TANGGAL_KOREKSI - TO_DATE('01/11/2021', 'DD/MM/YYYY'))/7 +1) WEEK, 
                  TM.NILAI NILAI
                FROM TUGAS_MHS TM, TUGAS T, KULIAH K
                WHERE 
                  T.NOMOR = TM.TUGAS AND
                  K.NOMOR = T.KULIAH AND
                  T.KULIAH = :0 AND 
                  TM.MAHASISWA = :1 AND
                  TRUNC(TM.TANGGAL_KOREKSI) BETWEEN TO_DATE('01/11/2021', 'DD/MM/YYYY') AND TO_DATE('20/02/2022', 'DD/MM/YYYY')
                ORDER BY 
                  WEEK`, [id_kuliah, id])
      .then((res) => {
        let data = [];
        let score;
        for (let i = 1; i <= 16; i++) {
          {
            for (const item of res.rows) {
              if (item[0] == i){
                score = item[1];
                item.shift();
                break;
              } else {
                score = 0;
              } 
            }
            data.push({
              week: i,
              score: score.toFixed(2),
            })
          }           
        }
        
        return { data: data }          
      })
      .catch((err) => {
        console.log('mahasiswa dataGrafikNilaiKelas : ', err);
        return {
          data: null,
        };
      })
  },

};
