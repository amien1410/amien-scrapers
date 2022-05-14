const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const mysql = require('mysql');
const url = 'https://al-maktaba.org/book/11430';

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_wa_app'
});

  
axios(url)
    .then(response => {
        const html = response.data;
        const $ = cheerio.load(html);
        let selector = $('.betaka-index > ul > li:not(:first-child):not(:last-child) > ul > li > a[href^="https"]');
        let results = [];
        selector.each((index, element) => {
            let keyword = $(element).text();
            let url = $(element).attr('href');
            connection.connect(function(err) {
              if (err) throw err;
              console.log("Connected!");
              var sql = "INSERT INTO list_ensiklopedi (keyword, url) VALUES ?";
              connection.query(sql, [keyword, url], function (err, result) {
                if (err) throw err;
              });
            });
            // results.push({
            //     id: index,
            //     keyword: $(element).text(),
            //     url: $(element).attr('href')
            // });
        });
    
        // // console.log(results);
        // fs.writeFile('./data/keywords.json', JSON.stringify(results), (error) => {
        //     if (error) throw error;
        // })
        console.log("its done");
    })
    .catch(console.error);

// // selector
// let links = $('.betaka-index > ul > li:nth-child(2) > ul > li > a[href^="https"]');
// let length = $('.betaka-index > ul > li:not(:first):not(:last)');
