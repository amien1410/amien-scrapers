const axios = require("axios");
const cheerio = require('cheerio');

let daftar_koleksi = () => {
    axios.get(
            'https://api.sunnah.com/v1/collections?limit=50&page=1',
            {
                headers: {
                    'X-API-Key': 'SqD712P3E82xnwOAEOkGd5JZH8s9wRR24TqNFzjk'
                }
            }
        ).then((res) => {         
            console.log(res.data);
        }).catch((err) => {
            console.error(err);
        });
}