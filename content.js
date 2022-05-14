const express = require("express");
const cors = require("cors");
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
// const url = 'http://hadithtransmitters.hawramani.com/%d8%a3%d8%a8%d8%a7%d9%86-%d8%a7%d9%84%d8%b1%d9%82%d8%a7%d8%b4%d9%8a/?book=5520';

// json file
let nass = fs.readFileSync('./rijal/tarikh-alkabir.json');
let nassParse = JSON.parse(nass);

const app = express();
let result = [];

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

let get_nass = async () => {
    for (let x in nassParse) {
        let url = nassParse[x]['url'];
        let id = nassParse[x]['id'];
        try {
            let response = await axios(url);
            const html = response.data;
            $ = cheerio.load(html);
            // let index = $('div.letter-nav-container > div.letter-nav-contents').length;
            $('article:first').each((index, element) => {
                result.push({
                    id: id,
                    nama: $(element).find('h1').text(),
                    isi: $(element).find('.definition').text(),
                });
                console.log(id);
            });
            
            // fs.writeFile('./rijal/ats-tsiqat-ibn-hibban.json', JSON.stringify(rijal), (error) => {
            //     if (error) throw error;
            // })
            // console.log('berhasil ' + x);
        } catch (error) {
            console.log("ada kesalahan proses axios");
        }
    }
    fs.writeFile('./data/tarikh-alkabir.json', JSON.stringify(result), (error) => {
        if (error) throw error;
    })
};

get_nass();

// for (let x in nassParse) {
//     let url = nassParse[x]['url'];
//     axios(url)
//       .then(response => {
//         const html = response.data;
//         $ = cheerio.load(html);
//         // let index = $('div.letter-nav-container > div.letter-nav-contents').length;
//         $('article:first').each((index, element) => {
//             result.push({
//                 id: index,
//                 nama: $(element).find('h1').text(),
//                 isi: $(element).find('.definition').text(),
//             });
//             console.log(index);
//         });
        
//         // fs.writeFile('./rijal/ats-tsiqat-ibn-hibban.json', JSON.stringify(rijal), (error) => {
//         //     if (error) throw error;
//         // })
//         console.log('berhasil ' + x);
//       })
//       .catch(console.error);
// }

// simple route
app.get("/", (req, res) => {
  res.json(result);
});

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});