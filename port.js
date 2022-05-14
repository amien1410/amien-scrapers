const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');


axios('http://www.worldportsource.com/countries.php')
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    const result = [];
    // const books = $('div.haditBooks > h2').length;
    $('#content_3col > table > tbody > tr > td').each((index, element) => {
        result.push({
            link: $(element).find('a').attr('href'),
        });
    });
    console.log(result);
  })
  .catch(console.error);

let getAll = async () => {
    console.log(kutub.length);
    let big_result = [];
    for (var i = 0; i < kutub.length; i++) {
        try {
            let response = await axios(kutub[i].link);
            const html = response.data;
            const $ = cheerio.load(html);
            big_result.push({
                nama: kutub[i].nama,
                info_kitab: $('#defaultModal > div > div > div.modal-body > ul').text().trim()
            })
            console.log('DONE '+ i);
        } catch (error) {
            console.log("ada kesalahan proses axios");
        }
    }
    console.log('DONE');
    fs.writeFileSync('./bab_links/notes2.json', JSON.stringify(big_result), (error) => {
        if (error) throw error;
    });
    
};
// getAll();