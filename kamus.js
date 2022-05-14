const axios = require("axios");
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const fs = require('fs');

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin())

// load database kamus
let munawwir = fs.readFileSync('./data/munawwir.json');
let js = JSON.parse(munawwir);

// cari kata di kamus
function cari_kata(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(cari_kata(obj[i], key, val));    
        } else 
        //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
        if (i == key && obj[i] == val || i == key && val == '') { //
            objects.push(obj);
        } else if (obj[i] == val && key == ''){
            //only add if the object is not already in the array
            if (objects.lastIndexOf(obj) == -1){
                objects.push(obj);
            }
        }
    }
    return objects;
}

// arti kata dari almaany.com
let arti_kata = (kata) => {
	let url = 'https://www.almaany.com/id/dict/ar-id/'+kata;
	puppeteer.launch({ headless: false })
	  .then(async browser => browser.newPage())
	  .then(page => {
	    page.setRequestInterception(true);
	    page.on('request', request => {
	      if (request.isNavigationRequest() && request.redirectChain().length)
	        request.abort();
	      else
	        request.continue();
	    });
	    return page.goto(url).then(function() {
	      return page.content();
	    });
	  })
	  .then(html => {
	    let $ = cheerio.load(html);
	    let list = [];
	    $('div#meaning > div.panel-body > table > tbody > tr').each((index, element) => {
	      list.push({
	        no: index + 1,
	        indo: $(element).find('td:nth-child(1)').text().trim().replace('[Umum]', ''),
	        arab: $(element).find('td:nth-child(2)').text().trim()
	      })
	    })
	    console.log(JSON.stringify(list));
	  })
	  .catch(console.error);
}

// arti kata arab ke arab
let arab_arab = (kata) => {
	let url = 'https://www.almaany.com/ar/dict/ar-ar/'+kata;
	puppeteer.launch({ headless: false })
	  .then(async browser => browser.newPage())
	  .then(page => {
	    page.setRequestInterception(true);
	    page.on('request', request => {
	      if (request.isNavigationRequest() && request.redirectChain().length)
	        request.abort();
	      else
	        request.continue();
	    });
	    return page.goto(url).then(function() {
	      return page.content();
	    });
	  })
	  .then(html => {
	    let $ = cheerio.load(html);
	    let list = [];
	    $('#page-content > div.mainbar-column > div.panel.panel-default > div > ol:nth-child(2) > li').each((index, element) => {
	      list.push({
	        no: index + 1,
	        kata_arab: $(element).find('span').text().trim(),
	        keterangan: $(element).find('li.more').text().trim()
	      })
	    })
	    console.log(JSON.stringify(list));
	  })
	  .catch(console.error);
}

// sinonim antonim
let sino_anto = (kata) => {
	let url = 'https://www.almaany.com/ar/thes/ar-ar/'+kata;
	puppeteer.launch({ headless: false })
	  .then(async browser => browser.newPage())
	  .then(page => {
	    page.setRequestInterception(true);
	    page.on('request', request => {
	      if (request.isNavigationRequest() && request.redirectChain().length)
	        request.abort();
	      else
	        request.continue();
	    });
	    return page.goto(url).then(function() {
	      return page.content();
	    });
	  })
	  .then(html => {
	    let $ = cheerio.load(html);
	    let list = [];
	    let sinonim = [];
	    let antonim = [];
	    $('#page-content > div.mainbar-column > div.panel.panel-default').each((index, element) => {
	      sinonim.push({
	        no: index + 1,
	        kata_arab: $(element).find('h2.section').text().trim(),
	        keterangan: $(element).find('ul.list-inline').text().trim()
	      })
	    });
	    $('#page-content > div.mainbar-column > div.panel.panel-lightgreen').each((index, element) => {
	      antonim.push({
	        no: index + 1,
	        kata_arab: $(element).find('h2.section').text().trim(),
	        keterangan: $(element).find('ul.list-inline').text().trim()
	      })
	    });
	    list.push({
	    	sinonim: sinonim,
	    	antonim: antonim
	    });
	    console.log(JSON.stringify(list));
	  })
	  .catch(console.error);
}

// tashrif
let tashrif = (kata) => {
	let param = {
		data: {
			text: kata,
			action:"Conjugate",
			all:true,
			transitive:true,
			past:true,
			future:true,
			imperative:true,
			future_moode:true,
			confirmed:true,
			passive:true,
			future_type:"فتحة"
		}
	};

	axios.post('https://qutrub.arabeyes.org/ajaxGet', param)
		.then(function (response) {
			let result = response.data.result;
			let length = Object.keys(result).length;
			let madhi = []; let mudhari = []; let amr = [];
			let info = response.data.verb_info;
			let keys = [8,10,12,9,11,13,2,4,6,3,5,7,0,1]
			for (var i = 1; i < length; i++) {
				madhi.push(
					result[i][1]
				);
				mudhari.push(
					result[i][2]
				);
				if (result[i][6] != '') {
					amr.push(
						result[i][6]
					);
				}
				// console.log(result[i][1]);
			}
			console.log(rearrange(madhi));
			console.log(rearrange(mudhari));
			console.log(rearrange(amr, true));
			// console.log(length);
	        // const $ = cheerio.load(response.data);
	        // const div = $('div.alert').text().split(' ');
	        // const int = parseInt(div[5]);
	    })
	    .catch(function (error) {
	        console.log(error);
	    });

}

let rearrange = (arr, amr = false) => {
	if(amr == true) {
		return [
	    	arr[0], arr[2], arr[4],
	    	arr[1], arr[3], arr[5]
	    ]
	} else {
		return [
	    	arr[8], arr[10], arr[12],
	    	arr[9], arr[11], arr[13],
	    	arr[2], arr[4], arr[6],
	    	arr[3], arr[5], arr[7],
	    	arr[0], arr[1]
	    ]
	}
};

// testing
// cari_kata(js, '', 'sore');
// arti_kata('%D8%AC%D9%8E%D8%A7%D8%B1%D9%90%D8%AD%D9%8E%D8%A9');
// tashrif('حمل');
// arab_arab('خشية')
sino_anto('خشية');