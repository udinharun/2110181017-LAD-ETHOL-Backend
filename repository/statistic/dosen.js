module.exports = {
    rataRataNilai: (conn, id_kuliah) => {
        return conn
          .execute(`SELECT AVG(TM.NILAI)
                    FROM KULIAH K, TUGAS T, TUGAS_MHS TM
                    WHERE 
                      T.NOMOR = TM.TUGAS AND 
                      T.KULIAH = :0`, [id_kuliah])
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
            console.log("dosen rataRataNilai : ", err);
            return {
              total: null,
            };
          });
    },
    ambilTugasTerkumpul: (conn, id, id_kuliah) => {
      return conn
        .execute(`SELECT COUNT(*) 
                  FROM TUGAS_MHS TM, TUGAS T, KULIAH K
                  WHERE 
                    TM.TUGAS = T.NOMOR AND 
                    T.KULIAH = K.NOMOR AND 
                    K.NOMOR = :1 AND
                    K.DOSEN = :0`, [id, id_kuliah])
        .then((res) => {
          if (res.rows.length) {
            return {
              submit: res.rows[0][0],
            };
          } else {
            return {
              submit: null,
            };
          }
        })
        .catch((err) => {
          console.log("dosen ambilSemuaTugas : ", err);
          return {
            submit: null,
          };
        });
    },
    ambilSemuaTugas: (conn, id, id_kuliah) => {
      return conn
        .execute(`SELECT COUNT(*)  
                  FROM TUGAS T, KULIAH K
                  WHERE 
                    T.KULIAH = K.NOMOR AND
                    T.KULIAH = :1 AND 
                    K.DOSEN = :0`, [id, id_kuliah])
        .then((res) => {
          if (res.rows.length) {
            return {
              totalAssignment: res.rows[0][0],
            };
          } else {
            return {
              totalAssignment: null,
            };
          }
        })
        .catch((err) => {
          console.log("dosen ambilSemuaTugas : ", err);
          return {
            totalAssignment: null,
          };
        });
    },
    ambilMahasiswaAktifitasRendah: (conn, id_kuliah, jenis_schema) => {
      return conn
        .execute(`SELECT COUNT(*)
                  FROM MAHASISWA_KATEGORI_NILAI MKN
                  WHERE 
                    MKN.TOTAL = 'Low' AND 
                    MKN.KULIAH = :0 AND
                    MKN.JENIS_SCHEMA = :1`, [id_kuliah, jenis_schema])
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
          console.log('dosen ambilMahasiswaAktifitasRendah : ', err);
          return {
            activity: null,
          };
        })
    },
    ambilTotalMahasiswa: (conn, id_kuliah) => {
      return conn
        .execute(`SELECT 
                    M.NOMOR, M.NAMA, M.NRP, K.KODE_KELAS, MKN.ABSEN, MKN.TUGAS, 
                    MKN.TOTAL, AVG(TM.NILAI) NILAI, COUNT(TM.NILAI) SUBMIT
                  FROM MAHASISWA M
                  LEFT JOIN 
                    TUGAS_MHS TM 
                  ON
                    TM.MAHASISWA = M.NOMOR 
                  JOIN 
                    MAHASISWA_SEMESTER MS 
                  ON 
                    MS.MAHASISWA = M.NOMOR 
                  JOIN 
                    KULIAH K 
                  ON 
                    K.NOMOR = MS.KULIAH
                  LEFT JOIN 
                    MAHASISWA_KATEGORI_NILAI MKN 
                  ON 
                    MKN.MAHASISWA = M.NOMOR 
                  WHERE 
                    K.NOMOR = :0 AND MKN.KULIAH = :0
                  GROUP BY 
                    M.NOMOR, M.NAMA, M.NRP, K.KODE_KELAS, 
                    MKN.ABSEN, MKN.TUGAS, MKN.TOTAL
                  ORDER BY M.NRP`, [id_kuliah])
        .then((res) => {
          return {
            totalStudent: res.rows.length,
            students: res.rows.map((item) => {
              {            
                item[7] == null ? item[7] = 0 : item[7];    

                return {
                  id: item[0],
                  name: item[1],
                  score: item[7],
                  nrp: item[2],
                  class: item[3],
                  absent: item[4],
                  assignment: item[5],
                  activity: item[6], 
                  submit: item[8], 
                }
              }
            })        
          }          
        })
        .catch((err) => {
          console.log('dosen ambilTotalMahasiswa : ', err);
          return {
            totalStudent: null,
            students: null,
          };
        })
    },
    dataGrafikScore: (conn, id, id_kuliah) => {
      return conn
        .execute(`SELECT 
                    TRUNC((TM.TANGGAL_KOREKSI - TO_DATE('01/11/2021', 'DD/MM/YYYY'))/7 +1) WEEK, 
                    AVG(TM.NILAI) NILAI
                  FROM TUGAS_MHS TM, TUGAS T, KULIAH K
                  WHERE 
                    T.NOMOR = TM.TUGAS AND
                    K.NOMOR = T.KULIAH AND
                    T.KULIAH = :1 AND 
                    K.DOSEN = :0 AND
                    TRUNC(TM.TANGGAL_KOREKSI) BETWEEN TO_DATE('01/11/2021', 'DD/MM/YYYY') AND TO_DATE('20/02/2022', 'DD/MM/YYYY')
                  GROUP BY 
                    TRUNC((TM.TANGGAL_KOREKSI - TO_DATE('01/11/2021', 'DD/MM/YYYY'))/7 +1)
                  ORDER BY 
                    WEEK`, [id, id_kuliah])
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
          console.log('dosen dataScoreGrafik : ', err);
          return {
            data: null,
          };
        })
    },
    dataGrafikActivity: (conn, id_kuliah, jenis_schema) => {
      return conn
        .execute(`SELECT MKN.TOTAL, COUNT(*) TOTAL 
                  FROM MAHASISWA_KATEGORI_NILAI MKN, MAHASISWA M, MAHASISWA_SEMESTER MS, KULIAH K
                  WHERE 
                    M.NOMOR = MKN.MAHASISWA AND 
                    M.NOMOR = MS.MAHASISWA AND 
                    K.NOMOR = MS.KULIAH AND 
                    K.NOMOR = MKN.KULIAH AND 
                    MKN.KULIAH = :0 AND
                    MKN.JENIS_SCHEMA = :1
                  GROUP BY MKN.TOTAL`, [id_kuliah, jenis_schema])
        .then((res) => {
          let label = ['High', 'Medium', 'Low'];
          let total;
          let activity = [];

          label.forEach(label => {
            for (const item of res.rows) {
              if (label == item[0]){
                total = item[1];
                break;
              } else
                total = 0;                
            } 
            activity.push({
              label: label,
              total: total
            })
          });

          return { activity: activity }
        })
        .catch((err) => {
          console.log('dosen dataScoreGrafik : ', err);
          return {
            data: null,
          };
        })
    },
};
  