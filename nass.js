const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const sql = require("./helpers/db.js");
const url = 'https://shamela.ws/book/11430/';

// axios(url)
//     .then(response => {
//         const html = response.data;
//         const $ = cheerio.load(html);
//         let result = $('input[type="hidden"][id="fld_part_top"]').val();
//         let halaman = $('input[type="number"][id="fld_goto_top"]').val();
//         console.log(result);
//         console.log(halaman);
//     })
//     .catch(console.error);

// for (var i = 75; i <= 80 ; i++) {
//     axios(url + i)
//         .then(response => {
//             const html = response.data;
//             const $ = cheerio.load(html);
//             let nass = fs.readFileSync('./data/nass.json');
//             let nassParse = JSON.parse(nass);
//             let halaman = i;
//             nassParse.push({
//                 page: halaman,
//                 // text: $('.nass p:not(.hamesh)').text().replace(/["']/g, ""),
//                 text: $('.nass p:not(.hamesh)').text(),
//                 notes: $('.nass p.hamesh').text()
//             });
//             fs.writeFileSync('./data/nass.json', JSON.stringify(nassParse), (error) => {
//                 if (error) throw error;
//             });
//             console.log(url + i);
//         })
//         .catch(console.error);
//     console.log("its done, next page is " + i++);
// }

let get_nass = async () => {
    for (var i = 70; i <= 100; i++) {
        let nassParse = [];
        try {
            let response = await axios(url + i);
            const html = response.data;
            const $ = cheerio.load(html);
            let juz = $('input[type="hidden"][id="fld_part_top"]').val();
            let halaman = $('input[type="number"][id="fld_goto_top"]').val();
            nassParse.push({
                id_kitab: '3',
                page: juz+'-'+halaman,
                // text: $('.nass p:not(.hamesh)').text().replace(/["']/g, ""),
                text: $('.nass p:not(.hamesh)').text(),
                notes: $('.nass p.hamesh').text()
            });
            // fs.writeFileSync('./data/nass.json', JSON.stringify(nassParse), (error) => {
            //     if (error) throw error;
            // });
        } catch (error) {
            console.log("ada kesalahan proses axios");
        }
        sql.query("INSERT INTO kutub SET ?", nassParse, (err, res) => {
            if (err) {
              console.log("error: ", err);
            }

            console.log("berhasil " + i);
        });
    }
};

get_nass();