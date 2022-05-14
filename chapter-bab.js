const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
let base_url = 'https://islamarchive.cc//';
// let links = fs.readFileSync('./bab_links/kutub_links.json');
// let links_parsed = JSON.parse(links);

// let get_bab_links = async () => {
//     for (let x in links_parsed) {
//         let kitab_apa = links_parsed[x]['nama'];
//         let bab_links = [];
//         for (var i = 0; i < links_parsed[x]['bab'].length; i++) {
//             // console.log(links_parsed[x]['bab'][i]['url']);
//             try {
//                 let response = await axios(links_parsed[x]['bab'][i]['url']);
//                 const html = response.data;
//                 const $ = cheerio.load(html);
//                 let audio = $('audio').find('source').attr('src');
//                 const sub_bab = [];
//                 const kitab = $('span.inverted_head').text();
//                 let nama_kitab = kitab.substring(
//                             kitab.indexOf("(") + 1, 
//                             kitab.lastIndexOf(")")
//                         );
//                 $('ol.list > li').each((index, element) => {
//                     let url = base_url+$(element).find('a').attr('href');
//                     let id = url.split('bab_id=');
//                     sub_bab.push({
//                         sub_bab_id: parseInt(id[1]),
//                         nama_bab: $(element).find('a').text(),
//                         url: url
//                     });
//                     // console.log(sub_bab);
//                 });
//                 bab_links.push({
//                     id: i,
//                     kitab: nama_kitab,
//                     sub_bab: sub_bab,
//                     audio: audio
//                 });
//                 console.log(i);
//             } catch (error) {
//                 console.log("ada kesalahan proses axios");
//             }
//         }
//         console.log('next Kitab');
//         // console.log('DONE');
//         fs.writeFileSync('./bab_links/'+kitab_apa+'.json', JSON.stringify(bab_links), (error) => {
//             if (error) throw error;
//         });

//     }
// };

// get_bab_links();

let kutub = [
  {
    nama: '  سنن أبي داوود',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=26'
  },
  {
    nama: '  جامع الترمذي',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=38'
  },
  {
    nama: '  السنن الصغرى للنسائي',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=25'
  },
  {
    nama: '  سنن ابن ماجة',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=27'
  },
  {
    nama: '  سنن الدارمي',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=32'
  },
  {
    nama: '  السنن الكبير للبيهقي',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=49'
  },
  {
    nama: '  السنن الصغير للبيهقي',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=44'
  },
  {
    nama: '  سنن الدارقطني',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=46'
  },
  {
    nama: '  سنن سعيد بن منصور',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=47'
  },
  {
    nama: '  السنن الكبرى للنسائي',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=48'
  },
  {
    nama: '  السنن المأثورة للشافعي',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=102'
  },
   {
    nama: '  الجامع لمعمّر بن راشد',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=63'
  },
  {
    nama: '  الجامع لعبد الله بن وهب',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=64'
  },
   {
    nama: '  مصنّف بن أبي شيبة',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=62'
  },
  {
    nama: '  مصنّف عبد الرزاق',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=61'
  },
  {
    nama: '  تهذيب الآثار للطبري',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=143'
  },
  {
    nama: '  الأوسط لابن المنذر',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=157'
  },
  {
    nama: '  شرح معاني الآثار للطحاوي',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=159'
  },
  {
    nama: '  الآثار لأبي يوسف القاضي',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=97'
  },
  {
    nama: '  الآثار لمحمد بن الحسن الشيباني',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=98'
  },
  {
    nama: '  السير لأبي إسحاق الفزاري',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=800'
  },
  {
    nama: '  مسند أحمد ابن حنبل',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=35'
  },
  {
    nama: '  مسند البزار',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=45'
  },
  {
    nama: '  مسند الحميدي',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=28'
  },
  {
    nama: '  مسند الطيالسي',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=41'
  },
  {
    nama: '  مسند إسحاق بن راهويه',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=50'
  },
  {
    nama: '  مسند أبي يعلى الموصلي',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=52'
  },
  {
    nama: '  مسند ابن أبي شيبة',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=54'
  },
  {
    nama: '  مسند أبي حنيفة برواية أبي نعيم',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=57'
  },
  {
    nama: '  مسند الشافعي',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=60'
  },
  {
    nama: '  مسانيد فراس المكتب',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=89'
  },
  {
    nama: '  مسند عبدالله بن المبارك',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=95'
  },
  {
    nama: '  مسند سعد بن أبي وقاص',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=115'
  },
  {
    nama: '  المنتخب من مسند عبد بن حميد',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=117'
  },
  {
    nama: '  مسند بلال بن رباح',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=120'
  },
  {
    nama: '  الجزء العاشر من مسند عمر بن الخطاب ليعقوب بن شيبة ',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=122'
  },
  {
    nama: '  مسند عبد الله بن عمر للطرسوسي',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=127'
  },
  {
    nama: '  مسند عبد الرحمن بن عوف للبرتي',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=132'
  },
  {
    nama: '  بغية الباحث عن زوائد مسند الحارث',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=133'
  },
  {
    nama: '  مسند أبي بكر الصديق',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=136'
  },
  {
    nama: '  مسند الروياني',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=142'
  },
  {
    nama: '  مسند عمر بن عبد العزيز',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=147'
  },
  {
    nama: '  مسند عائشة',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=150'
  },
  {
    nama: '  مسند أسامة بن زيد',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=151'
  },
  {
    nama: '  مسند ابن أبي أوفى',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=158'
  },
  {
    nama: '  المسند للشاشي',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=167'
  },
  {
    nama: '   المنتقى من مسند المقلين لدعلج السجزي',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=170'
  },
  {
    nama: '  المعجم الكبير للطبراني',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=40'
  },
  {
    nama: '  المعجم الأوسط للطبراني',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=39'
  },
  {
    nama: '  المعجم الصغير للطبراني',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=36'
  },
  {
    nama: '  معجم ابن المقرئ',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=58'
  },
  {
    nama: '  معجم ابن الأعرابي',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=59'
  },
  {
    nama: '  معجم أبي يعلى الموصلي',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=141'
  },
  {
    nama: '  مستخرج أبي عوانة',
    link: 'https://islamarchive.cc//index.php?p=hadith_chapters&cat_id=43'
  }
];


// axios('https://islamarchive.cc//HadithFirst?bookindex=45')
//   .then(response => {
//     const html = response.data;
//     const $ = cheerio.load(html);
//     const result = [];
//     // const books = $('div.haditBooks > h2').length;
//     $('div.box-content > h2').each((index, element) => {
//         result.push({
//             nama: $(element).text(),
//             link: $(element).find('a').attr('href'),
//         });
//     });
//     console.log(result);
//   })
//   .catch(console.error);

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
let getAll2 = async () => {
    let big_result = [];
    for (var i = 31; i < 41; i++) {
        let daftar_kitab = [];
        try {
            let response = await axios('https://shamela.ws/category/'+i);
            const $ = cheerio.load(response.data);
            let section = $('#wrapper > section.page-header.page-header-sm > div > h1').text().trim();
            $('.book_item').each((index, element) => {
              daftar_kitab.push({
                id : $(element).find('.book_title').attr('href').split("/")[4],
                  nama_kitab : $(element).find('.book_title').text().trim(),
                  pengarang : $(element).find('a.text-gray').text().trim()
              });
            });
            big_result.push({
              id: i,
              section: section,
              daftar_kitab : daftar_kitab
            })
            console.log('DONE '+ i);
        } catch (error) {
            console.log("ada kesalahan proses axios");
        }
    }
    console.log('DONE');
    fs.writeFileSync('./bab_links/shamela_kutub_ids4.json', JSON.stringify(big_result), (error) => {
        if (error) throw error;
    });
    
};
getAll2();