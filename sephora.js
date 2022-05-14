// import library
const axios = require('axios');
const fs = require('fs');

// building loop axios
let get_reviews = async () => {
	let result = [];
	for (var i = 0; i < 4; i++) {
		let offset = i * 100;
        try {
            let response = await axios('https://api.bazaarvoice.com/data/reviews.json?Filter=contentlocale%3Aen*&Filter=ProductId%3AP468353&Sort=SubmissionTime%3Adesc&Limit=100&Offset='+offset+'&Include=Products%2CComments&Stats=Reviews&passkey=caQ0pQXZTqFVYA1yYnnJ9emgUiW59DXA85Kxry8Ma02HE&apiversion=5.4&Locale=en_US');
            let json = response.data.Results;
            for (let i = 0; i < json.length; i++) {
            	let age;
            	let verified_purchaser;
            	if('age' in json[i].ContextDataValues){
            		age = json[i].ContextDataValues.age.Value;
            		// console.log('Umur ' + i + true);
            	} else {
            		age = null;
            		// console.log('Umur ' + i + false);
            	}
            	if('VerifiedPurchaser' in json[i].ContextDataValues){
            		verified_purchaser = json[i].ContextDataValues.VerifiedPurchaser.Value;
            		// console.log('Gratis ' + i + true);
            	} else {
            		verified_purchaser = false;
            		// console.log('Gratis ' + i + false);
            	}
            	// result.push({
            	// 	name: json[i].UserNickname,
            	// 	rating: json[i].Rating,
            	// 	recemonded: json[i].IsRecommended,
            	// 	title: json[i].Title,
            	// 	text: json[i].ReviewText,
            	// 	time: json[i].SubmissionTime,
            	// 	age: age,
            	// 	sephora_staff: json[i].ContextDataValues.StaffContext.Value,
            	// 	verified_purchaser: verified_purchaser,
            	// 	free_product: json[i].ContextDataValues.IncentivizedReview.Value,
            	// })
            	console.log(verified_purchaser);
            }
            // console.log(result);
        } catch (error) {
            console.log("ada kesalahan proses axios");
        }
    }
    // fs.writeFileSync('./reviews.json', JSON.stringify(result), (error) => {
    //     if (error) throw error;
    // });
}

get_reviews();