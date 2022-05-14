// load modules
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const fs = require('fs');

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin())

const run = async () => {
  	const browser = await puppeteer.launch({headless: false});
  	const [page] = await browser.pages();
  	let result = [];
	let ratusan = [
	   	1021340, 1022340, 1023340, 1024340
  	];  
  	for (let i = 1019960; i < 1024341; i++) {
  		
    	try {
    		let ids = []
		    await page.goto("https://greenecountymo.gov/collector/search/info.php?account="+i);
		    await page.waitForTimeout(2000);
		    const data = await page.evaluate(() => document.querySelector('div#middle_section').outerHTML);
		    let $ = cheerio.load(data);
	      	result.push({
		      	account: $('input[name=account]').attr('value'),
			    name: $('#collector_search_info_name').text().trim(),
			    mail_address: $('#collector_search_info_mail').text().trim(),
			    location_address: $('#collector_search_info_loc').text().trim(),
			    2017: $('#results_out > tbody > tr:nth-child(2) > td:nth-child(6)').text().trim(),
			    2018: $('#results_out > tbody > tr:nth-child(3) > td:nth-child(6)').text().trim(),
			    2019: $('#results_out > tbody > tr:nth-child(4) > td:nth-child(6)').text().trim(),
			    2020: $('#results_out > tbody > tr:nth-child(5) > td:nth-child(6)').text().trim(),
			    2021: $('#results_out > tbody > tr:nth-child(6) > td:nth-child(6)').text().trim(),
	      	});
    	}
    	catch (err) {}
    	if (ratusan.includes(i) == true) {
    		console.log(i);
    		fs.writeFile('./details_'+i+'.json', JSON.stringify(result), (error) => {
		       	if (error) throw error;
		    })	
    	}
  	}
  	await browser.close();
   	// fs.writeFile('./marc.json', JSON.stringify(result), (error) => {
    //    	if (error) throw error;
    // })
};

run();
