const express = require('express');
const cors = require('cors');
const axios = require("axios");
const cheerio = require('cheerio');

const app = express();
const result = [];
// const daftar_kitab = [];

const corsOption = {
	origin: "http://localhost:8080"
};

app.use(cors(corsOption));

// parse request json
app.use(express.json());

// parse request urlencoded
app.use(express.urlencoded({ extended: true}));

// 2. menampilkan beberapa ayat dari satu surah
// source :
// kitab-kitab hadis terkenal - https://islamarchive.cc/actions.php?&p=hadith&viewby=SearchHadith&search=%D9%84%D8%A7%20%D9%88%D8%B5%D9%8A%D8%A9%20%D9%84%D9%88%D8%A7%D8%B1%D8%AB&haditBook=subAll
// semua kitab hadis - https://islamarchive.cc/actions.php?&p=hadith&viewby=SearchHadith&search=%D9%84%D8%A7%20%D9%88%D8%B5%D9%8A%D8%A9%20%D9%84%D9%88%D8%A7%D8%B1%D8%AB&haditBook=all
// kitab shahih bukhari - https://islamarchive.cc/actions.php?&p=hadith&viewby=SearchHadith&search=%D9%84%D8%A7%20%D9%88%D8%B5%D9%8A%D8%A9%20%D9%84%D9%88%D8%A7%D8%B1%D8%AB&haditBook=33

let cari_hadis = (kata) => {
    axios.get('https://islamarchive.cc/actions.php?&p=search_home&search_type=hadith&searchword='+kata)
        .then((res) => {
            let $ = cheerio.load(res.data);
            let list = $('li');
            list.each((index, element) => {
                if($(element).text().includes('باب') == false && index > 0){
                	let url = $(element).find('a').attr('href');
                	let sub_url = url.substring(
					    url.indexOf("_") + 1, 
					    url.lastIndexOf("&")
					);
                    result.push({
                        kode_hadis: sub_url,
                        text: $(element).text().trim()
                    })
                    // console.log($(element).find('a').attr('href'));
                }
            })
            // console.log(JSON.stringify(result));
        }).catch((err) => {
            console.error(err);
        });
};

let buka_hadis = (id) => {
    axios.get('https://islamarchive.cc/Hadith_'+id)
        .then((res) => {
            let $ = cheerio.load(res.data);
            let cek_audio = $('audio#audioPlayer04 > source').length;
            let audio;
            if(cek_audio > 0) {
            	audio = 'https://islamarchive.cc' + $('audio#audioPlayer04 > source').attr('src');
            } else {
            	audio = 'Tidak ada audio untuk hadis ini';
            }
            let text = $('#hadith_ > table > tbody > tr > td:nth-child(2)').text();
            let derajat = $('button.btn.btn-outline.btn-rounded.btn-success.btn-sm.mb-2').length;
            let hukum, hukum_formated;
            if(derajat > 0) {
            	hukum = $('button.btn.btn-outline.btn-rounded.btn-success.btn-sm.mb-2').text().trim();
            } else {
            	hukum = '';
            }
            let text_formated = text.replace(/(^\s+|\s+$)/g, '');
            let bread = $('ul.breadcrumb > li:not(:first-child)');
            let loc = '';
            bread.each((index, element) => {
            	if(index != bread.length - 1){
            		loc += $(element).text().trim() + ' - ';
            	} else {
            		loc += $(element).text().trim();
            	}        	
            });
            result.push({
            	loc: loc,
            	audio: audio,
            	teks_hadis: text_formated,
            	derajat_hadis: hukum
            });
            console.log(result);
        }).catch((err) => {
            console.error(err);
        });
};
let daftar_kitab = () => {
    for (var i = 0; i < js.length; i++) {
        console.log('index: '+i);
        console.log(js[i].nama);
    }
}

// daftar_kitab();

let daftar_isi_kitab = (id_kitab) => {

    for (var i = 0; i < js[id_kitab].isi.length; i++) {
        console.log('id: ' + js[id_kitab].isi[i].id);
        console.log('kitab: ' + js[id_kitab].isi[i].kitab);
        console.log('audio: ' + js[id_kitab].isi[i].audio);
    }
}

// daftar_isi_kitab(0);

let daftar_isi_bab_kitab = (id_kitab, id_bab) => {
    let result = [];
    for (var i = 0; i < js[id_kitab].isi[id_bab].sub_bab.length; i++) {
        console.log('id: ' + js[id_kitab].isi[id_bab].sub_bab[i].sub_bab_id);
        console.log('nama bab: ' + js[id_kitab].isi[id_bab].sub_bab[i].nama_bab);
        console.log('url: ' + js[id_kitab].isi[id_bab].sub_bab[i].url);
    }
}

// daftar_isi_bab_kitab(0,1);

let get_url_bab = (id_kitab, id_bab, id_sub_bab) => {
    for (var i = 0; i < js[id_kitab].isi[id_bab].sub_bab.length; i++) {
        if (js[id_kitab].isi[id_bab].sub_bab[i].sub_bab_id == id_sub_bab) {
            let url = js[id_kitab].isi[id_bab].sub_bab[i].url;
            console.log('url: ' + url);
            break;
        } else {
            let url = 'Bab yang dicari tidak ditemukan';
            console.log('Bab yang dicari tidak ditemukan');
            break;
        }
    }
    return url;
}

// get_url_bab(1,1,0);

let get_hadis_bab = (url) => {
    axios.get(url)
        .then((res) => {
            let $ = cheerio.load(res.data);
            let entries = [];
            let bread = $('ul.breadcrumb > li:not(:first-child)');
            let loc = '';
            bread.each((index, element) => {
            	if(index != 0){
            		if(index != bread.length - 1){
	            		loc += $(element).text().trim() + ' - ';
	            	} else {
	            		loc += $(element).text().trim();
	            	} 
            	}      	
            });
            $('section.card > blockquote').each((index, element) => {
            	entries.push({
            		no: index + 1,
            		teks: $(element).find('div.col-sm-11.col-lg-11 > div').text().replace(/(^\s+|\s+$)/g, ''),
            		audio: $(element).find('source').attr('src'),
            		full: 'buka_hadis ' + $(element).find('div.col-sm-6.col-lg-6').find('a').attr('href').replace('H_','')
            	});
            });
            result.push({
            	bab: loc,
            	entry: entries
            });
            console.log(result);
        }).catch((err) => {
            console.error(err);
        });
}
// cari_hadis('%D9%84%D8%A7%20%D9%88%D8%B5%D9%8A%D8%A9%20%D9%84%D9%88%D8%A7%D8%B1%D8%AB');
buka_hadis(355108);
// daftar_kitab();
// daftar_isi_kitab(0);
// daftar_isi_bab_kitab(0,1);
// get_url_bab(1,1,0);
// get_hadis_bab('https://islamarchive.cc//index.php?p=hadith_bab_data&chapter_id=1&cat_id=33&bab_id=1');

// di bawah ini menggunakan sunnah-api.com
let daftar_koleksi = () => {
    axios.get(
            'https://api.sunnah.com/v1/collections?limit=50&page=1',
            {
                headers: {
                    'X-API-Key': 'SqD712P3E82xnwOAEOkGd5JZH8s9wRR24TqNFzjk'
                }
            }
        ).then((res) => {
        	result.push(res.data);         
            console.log(res.data);
        }).catch((err) => {
            console.error(err);
        });
}

let buka_koleksi = (koleksi) => {
    axios.get(
            'https://api.sunnah.com/v1/collections/'+koleksi,
            {
                headers: {
                    'X-API-Key': 'SqD712P3E82xnwOAEOkGd5JZH8s9wRR24TqNFzjk'
                }
            }
        ).then((res) => {
        	result.push(res.data);         
            console.log(res.data);
        }).catch((err) => {
            console.error(err);
        });
}

let buka_daftar_bab = (koleksi) => {
    axios.get(
            'https://api.sunnah.com/v1/collections/'+koleksi+'/books',
            {
                headers: {
                    'X-API-Key': 'SqD712P3E82xnwOAEOkGd5JZH8s9wRR24TqNFzjk'
                }
            }
        ).then((res) => {
        	result.push(res.data);         
            console.log(res.data);
        }).catch((err) => {
            console.error(err);
        });
}

let buka_bab_koleksi = (koleksi, id_book) => {
    axios.get(
            'https://api.sunnah.com/v1/collections/'+koleksi+'/books/'+id_book,
            {
                headers: {
                    'X-API-Key': 'SqD712P3E82xnwOAEOkGd5JZH8s9wRR24TqNFzjk'
                }
            }
        ).then((res) => {
        	result.push(res.data);         
            console.log(res.data);
        }).catch((err) => {
            console.error(err);
        });
}

let buka_hadis_bab_koleksi = (koleksi, id_book) => {
    axios.get(
            'https://api.sunnah.com/v1/collections/'+koleksi+'/books/'+id_book+'/hadiths',
            {
                headers: {
                    'X-API-Key': 'SqD712P3E82xnwOAEOkGd5JZH8s9wRR24TqNFzjk'
                }
            }
        ).then((res) => {
        	result.push(res.data);         
            console.log(res.data);
        }).catch((err) => {
            console.error(err);
        });
}

let buka_daftar_sub_bab = (koleksi, id_book) => {
    axios.get(
            'https://api.sunnah.com/v1/collections/'+koleksi+'/books/'+id_book+'/chapters?limit=50&page=1',
            {
                headers: {
                    'X-API-Key': 'SqD712P3E82xnwOAEOkGd5JZH8s9wRR24TqNFzjk'
                }
            }
        ).then((res) => {
        	result.push(res.data);         
            console.log(res.data);
        }).catch((err) => {
            console.error(err);
        });
}

let buka_hadis_koleksi = (koleksi, id_hadis) => {
    axios.get(
            'https://api.sunnah.com/v1/collections/'+koleksi+'/hadiths/'+id_hadis,
            {
                headers: {
                    'X-API-Key': 'SqD712P3E82xnwOAEOkGd5JZH8s9wRR24TqNFzjk'
                }
            }
        ).then((res) => {
        	result.push(res.data);         
            console.log(res.data);
        }).catch((err) => {
            console.error(err);
        });
}

let buka_hadis_sub_bab_koleksi = (koleksi, id_book, id_sub_bab) => {
    axios.get(
            'https://api.sunnah.com/v1/hadiths?collection='+koleksi+'&bookNumber='+id_book+'&chapterId='+id_sub_bab+'&limit=50',
            {
                headers: {
                    'x-api-key': 'SqD712P3E82xnwOAEOkGd5JZH8s9wRR24TqNFzjk'
                }
            }
        ).then((res) => {
        	result.push(res.data);         
            console.log(res.data);
        }).catch((err) => {
            console.error(err);
        });
}
// daftar_koleksi();
// buka_koleksi('muslim');
// buka_daftar_bab('muslim');
// buka_bab_koleksi('muslim',1);
// buka_hadis_bab_koleksi('bukhari',3);
// buka_daftar_sub_bab('bukhari', 2);
// buka_hadis_koleksi('bukhari', 59);
// buka_hadis_sub_bab_koleksi('bukhari', 2, 1);
// arti kata dari almaany.com


// simple route
app.get("/", (req, res) => {
	res.send(result);
	// res.json({ message: "Selamat datang di REST API Muhammad Amin"});
});

// set port and listen for request
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Server berjalan pada port ${PORT}.`);
});