const fs = require("fs");
const path = require("path");
const axios = require("axios");
const dotenv = require('dotenv');
const express = require("express");
const puppeteer = require("puppeteer-extra");

// init creds
const envPath = path.resolve(__dirname, './.env');
dotenv.config({ path: envPath});

const username = process.env.SALON_USERNAME;
const password = process.env.SALON_PASSWORD;

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

let frameStyle = {
    "": "",
    "FRONT": "SV01",
    "SIDE": "SV02",
    "BACK": "SV03",
    "ARRANGE": "SV04",
    "BEFORE": "SV05",
    "FASHION": "SV06"
};
let stylistList = {
    "": "",
    "MARUYAMA 髪質改善": "T000848294",
    "REINA ブリーチ": "T000848295",
    "TSUKINA  アレンジ": "T000848296",
    "COCORO 髪質改善": "T000848297",
    "HINAKA 髪質改善": "T000848298",
    "YUKA 髪質改善": "T000848299",
    "MIYU 髪質改善": "T000848300",
    "YUI 髪質改善": "T000848302",
    "MHOOD STYLE": "T000848305",
    "MHOOD RECRUIT": "T000848307",
    "YUKA 休日(非掲載)": "T000864173",
    "TAMAMI 休日(非掲載)": "T000864174",
    "MIYU 休日(非掲載)": "T000864176",
    "YUI 休日(非掲載)": "T000864177",
    "TAMAMI 髪質改善(非掲載)": "T000848301",
    "TUKIMI 髪質改善(非掲載)": "T000870989"
}
let couponList = {
    "MHOODにお任せ*『あなたをプロデュース』 迷ったらこちらでカウンセリング♪": "CP00000009018473",
    "【新規限定】ALL　MENU 　25%OFF": "CP00000009011113",
    "【２回目,3回目の方限定】ALL　MENU 　15%OFF": "CP00000009011162",
    "【女性限定】前髪と顔回りのカット+トリミングカット ¥4500→¥3375": "CP00000009011212",
    "[平日限定］カット + カラー+ TOKIO5stepTR￥15000→¥10350": "CP00000009388991",
    "【HINAKA 限定】カット＋カラー¥13000→¥8450《35%off》": "CP00000009027438",
    "【迷ったらこれ】前髪カット+フルカラー+TOKIO5stepTR ¥12500→¥9375": "CP00000008981320",
    "【TOKIO】 カット + カラーorパーマ + TOKIO5stepTR￥15000→¥11250": "CP00000008981318",
    "【SYSTEM】カット+カラーorパーマ+5stepリボーンTR ＜ホームケア付＞ ¥12750": "CP00000009011209",
    "【BYKARTE】カット+カラーorパーマ+髪質改善バイカルテトリートメント¥13500": "CP00000009232636",
    "（人気no.1)【オージュア】カット + カラーorパーマ + オージュアTR ￥14250": "CP00000009011208",
    "（人気no.2)【髪質改善】カット + フルカラー + 資生堂サブリミックTR": "CP00000008981337",
    "《ヘアセット》フルアップセット￥6500→￥4875": "CP00000009035800",
    "【シアカラー】フルカラー+シャンプーブロー¥6750": "CP00000009012446",
    "【シアカラー】フルカラー+ TOKIO5stepトリートメン ¥8625": "CP00000009012452",
    "【デザインカラー】ハイ＆ローライト(カラー+メッシュ20枚/1枚¥350)  ¥12375": "CP00000009012447",
    "【デザインカラー】インナーカラー(カラー+ブリーチデザインカラー) ¥12375": "CP00000009012449",
    "【シアカラー】ダブルカラー(フルカラー＋ブリーチカラー)￥18500 →¥13875": "CP00000009012450",
    "【透明感】 リタッチカラー￥2900  フルカラー￥3900": "CP00000009401407",
    "【サロン見学・美容学生】ALL　MENU 30%OFF": "CP00000009011148",
    "【次回予約・早割予約】ALL　MENU 　5%OFF": "CP00000009011172",
    "【専門学生・大学生限定】ALL　MENU 15%OFF": "CP00000009011132",
    "【中学生・高校生限定】ALL　MENU 25％OFF": "CP00000009011135",
    "《髪質改善》【TOKIO 5stepトリートメント】￥4500": "CP00000009012454",
    "《髪質改善》【SYSTEM 5stepトリートメント】＜ホームケア付＞￥6500": "CP00000009012457",
    "《髪質改善》【BYKARTE（バイカルテ)トリートメント】￥7500": "CP00000009232639",
    "《髪質改善》【Aujua(オージュア) 5stepトリートメント】￥8500": "CP00000009012459",
    "《髪質改善》【資生堂サブリミックトリートメント】￥10500": "CP00000009012464",
    "[酸性ストレートパーマ]髪に優しく癖を柔らかく自然に収める髪質改善メニュー": "CP00000009134948",
    "[酸性ストレートパーマ]髪に優しく癖を柔らかく自然に収める髪質改善＋カット": "CP00000009134958"
}
let lengthList = {
    "": "",
    "ベリーショート": "HL05",
    "ショート": "HL04",
    "ミディアム": "HL03",
    "セミロング": "HL02",
    "ロング": "HL01",
    "ヘアセット": "HL08",
    "ミセス": "HL07"
}

let colorList = {
    "": "",
    "ブラウン・ベージュ系": "HC01",
    "イエロー・オレンジ系": "HC02",
    "レッド・ピンク系": "HC03",
    "アッシュ・ブラック系": "HC04",
    "その他カラー": "HC05"
}

// get data from https://os3-318-48579.vs.sakura.ne.jp/api/style
let fetchData = async () => {
    let res = await axios.get('https://os3-318-48579.vs.sakura.ne.jp/api/style');
    // console.log(res.data);
    return res.data;
}

// function to do login
let loginProcess = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--disable-setuid-sandbox"],
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
  });

  try {
    await page.goto("https://salonboard.com/login/", { waitUntil: "networkidle0" });
    await page.type("input.w240", username);
    await page.type("input.loginPwInput", password);

    await page.waitForXPath('//*[@id="idPasswordInputForm"]/div/div[2]/a');
    const linkElement = await page.$x(
      '//*[@id="idPasswordInputForm"]/div/div[2]/a'
    );
    await linkElement[0].click();

    // Wait for login to complete and save cookies
    await page.waitForNavigation();
    // const cookies = await page.cookies();

    // // Save cookies to a JSON file
    // fs.writeFileSync('cookies.json', JSON.stringify(cookies));
    // await page.goto('https://salonboard.com/CNB/draft/styleEdit/', {waitUntil: 'networkidle0'});
    // await browser.close();

    return { browser, page };
  } catch (error) {
    console.error('Error during login:', error.message);
    // Retry login if there's an error
    await browser.close();
    return await loginProcess();
  }
  
}

// loginAndSave();

// check cookies valitidy
let checkCookiesValidity = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--disable-setuid-sandbox"],
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
  });

  // Load cookies from the saved JSON file
  const savedCookies = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));
  await page.setCookie(...savedCookies);

  // Navigate to the page to check cookies validity
  await page.goto('https://salonboard.com/CNB/draft/styleEdit/', {waitUntil: 'networkidle0'});
  // await page.waitForNavigation();

  // Check if the login button is present on the page
  const loginButton = await page.$('.mod_link_color01 > a');

  if (loginButton) {
    // If login button is found, cookies are invalid
    console.log('Cookies are invalid. Rerunning login...');
    await browser.close();
    return await loginProcess();
  } else {
    // If no login button, cookies are still valid
    console.log('Cookies are still valid.');
    return { browser, page };
  }
}

// select, type and click some inputs
const stylistInputs = async (page, data) => {
    await page.goto('https://salonboard.com/CNB/draft/styleEdit/', {waitUntil: 'networkidle0'});
    // select and click all inputs
    let stylistName = data['stylist_name'].trim();
    await page.select(
      'select[name="frmStyleEditStylistCommentDto.stylistId"]',
      stylistList[stylistName]
    );
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    
    await page.type(
      "textarea[name='frmStyleEditStylistCommentDto.stylistComment']",
      data['stylist_comment']
    );
    await page.type(
      "textarea[name='frmStyleEditArrangePointDto.point']",
      data['styling_arrangement_point']
    );
    await page.type(
      "input[name='frmStyleEditStyleDto.styleName']", 
      data['style_name']
    );

    // sex
    if (data['sex'] === 'female') {
        await page.click(
          'input#styleCategoryCd01'
        );
    } else {
        await page.click(
          'input#styleCategoryCd02'
        );
    }


    // hair length
    let length = data['length'];
    await page.select(
      'select[name="frmStyleEditStyleDto.ladiesHairLengthCd"]',
      lengthList[length]
    );
    console.log("Length option is selected");

    // hair color
    let color = data['color'];
    await page.select(
      'select[name="frmStyleEditStyleDto.hairColorCd"]',
      colorList[color]
    );
    console.log("Color option is selected");
    console.log("select color option 1 ok");

    // await page.click(
    //   "td.td_input_normal_color > table > tbody > tr > td > label > input[value='IC16']"
    // );

    // style image
    const radioLabels = await page.$$('tbody#ladiesImage label');

    // Iterate through labels to find the desired one
    for (const label of radioLabels) {
      const labelText = await label.evaluate(node => node.textContent.trim());

      // Check if the label text matches the desired text
      if (labelText === data['style_image']) {
        // Click the corresponding radio input
        const radioInput = await label.$('input[type="radio"]');
        await radioInput.click();
        console.log(`Clicked radio input with text: ${labelText}`);
        break; // Break the loop since we found and clicked the desired radio input
      }
    }
    console.log("radio image ok");

    // await new Promise((resolve) => setTimeout(resolve, 2000));

    // style_menu_perm
    if (data['style_menu_perm'] === true) {
        await page.click(
          'td.td_input_normal_color > table > tbody > tr > td > label > input[value="MC01"]'
        );
    }

    // style_menu_straight_perm
    if (data['style_menu_straight_perm'] === true) {
        await page.click(
          'td.td_input_normal_color > table > tbody > tr > td > label > input[value="MC02"]'
        );
    }

    // extensions
    if (data['extensions'] === true) {
        await page.click(
          'td.td_input_normal_color > table > tbody > tr > td > label > input[value="MC03"]'
        );
    }

    await page.type(
      "textarea[name='frmStyleEditStyleDto.menuContents']",
      data['menu_content']
    );
    console.log("type menu content 1");
}

const hairFaceType = async (page, data) => {
    // hair amount few
    if (data['hair_amount_few'] === true) {
        await page.click('input[value="recommendHairAmountFlg01"]');
    }
    
    // hair amount usually
    if (data['hair_amount_usually'] === true) {
        await page.click('input[value="recommendHairAmountFlg02"]');
    }

    // hair amount many
    if (data['hair_amount_many'] === true) {
        await page.click('input[value="recommendHairAmountFlg03"]');
    }

    // hair type soft
    if (data['hair_type_soft'] === true) {
        await page.click('input[value="recommendQualityHairFlg01"]');
    }

    // hair type usually
    if (data['hair_type_usually'] === true) {
        await page.click('input[value="recommendQualityHairFlg02"]');
    }

    // hair type hard
    if (data['hair_type_hard'] === true) {
        await page.click('input[value="recommendQualityHairFlg03"]');
    }

    // thickness thin
    if (data['thickness_thin'] === true) {
        await page.click('input[value="recommendThicknessFlg01"]');
    }

    // thickness usually
    if (data['thickness_usually'] === true) {
        await page.click('input[value="recommendThicknessFlg02"]');
    }

    // thickness thick
    if (data['thickness_thick'] === true) {
        await page.click('input[value="recommendThicknessFlg03"]');
    }

    // habit none
    if (data['habit_none'] === true) {
        await page.click('input[value="recommendHabitFlg01"]');
    }

    // habit bit
    if (data['habit_bit'] === true) {
        await page.click('input[value="recommendHabitFlg02"]');
    }

    // habit strong
    if (data['habit_strong'] === true) {
        await page.click('input[value="recommendHabitFlg03"]');
    }

    // face_type_round_shape
    if (data['face_type_round_shape'] === true) {
        await page.click('input[value="recommendMaskFlg01"]');
    }

    // face_type_inverted_triangle
    if (data['face_type_inverted_triangle'] === true) {
        await page.click('input[value="recommendMaskFlg02"]');
    }

    // face_type_egg_shapped
    if (data['face_type_egg_shapped'] === true) {
        await page.click('input[value="recommendMaskFlg03"]');
    }

    // face_type_base
    if (data['face_type_base'] === true) {
        await page.click('input[value="recommendMaskFlg04"]');
    }

    // face_type_square
    if (data['face_type_square'] === true) {
        await page.click('input[value="recommendMaskFlg05"]');
    }

    console.log("click completed");
    await new Promise((resolve) => setTimeout(resolve, 1000));
}

// upload images function
const retryUpload = async (page, frame = null, selectedFrame, imagePath, xPath, maxRetries = 5) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await uploadImage(page, frame, selectedFrame, imagePath, xPath);
      console.log('Upload successful');
      return; // Break out of the loop if upload is successful
    } catch (error) {
      console.error(`Upload attempt ${attempt} failed: ${error.message}`);
      // You can add additional error handling or logging here if needed

      // Retry after a short delay
      console.log(`Retrying upload after a delay...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.error(`Upload failed after ${maxRetries} attempts.`);
};

const uploadImage = async (page, frame=null, selectedFrame, imagePath, xPath) => {

    if (frame === 2) {
        await page.select(
          'select[name="frmStyleEditStyleInfoDto.styleClassCd02"]',
          frameStyle[selectedFrame]
        );
    };
    if (frame === 3) {
        await page.select(
          'select[name="frmStyleEditStyleInfoDto.styleClassCd03"]',
          frameStyle[selectedFrame]
        );
    };

    // img upload
    await page.waitForXPath(xPath);
    console.log("img search");
    
    const img = await page.$x(xPath);
    await img[0].click();
    console.log("img click");
    
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    await page.waitForXPath('//*[@id="imageUploaderModal"]');
    console.log("modal");

    await page.waitForXPath('//*[@id="formFile"]');
    console.log("input search");
    
    const modalElement = await page.$x('//*[@id="formFile"]');
    const filePath = path.relative(process.cwd(), __dirname + imagePath);

    await modalElement[0].uploadFile(filePath);
    await modalElement[0].evaluate((upload) =>
      upload.dispatchEvent(new Event("change", { bubbles: true }))
    );
    
    console.log("upload ok");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // await new Promise((resolve) => setTimeout(resolve, 5000));

    // await page.waitForXPath(
    //   '//*[@id="imageUploaderModal"]/div/div[2]/div/div[3]/input'
    // );
    // console.log("search");
    const inputElement = await page.$x(
      '//*[@id="imageUploaderModal"]/div/div[2]/div/div[3]/input'
    );
    // console.log("inputElement", inputElement);
    await inputElement[0].click();
    console.log("button click");
    console.log("wait");
    await new Promise((resolve) => setTimeout(resolve, 5000));
};

// click and select coupon function
const clickCoupon = async (page, data) => {

    // img upload
    // await page.waitForXPath('//*[@id="styleEditForm"]/table[4]/tbody/tr[9]/td/div[3]/a');    
    const img = await page.$x('//*[@id="styleEditForm"]/table[4]/tbody/tr[9]/td/div[3]/a');
    await img[0].click();
    console.log("coupon button clicked");
    
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    
    await page.waitForXPath('//*[@id="couponLinkForm"]');
    console.log("coupon modal is showed");

    const modalElement = await page.$x('//*[@id="couponLinkForm"]');
    let couponName = data['coupon']
    let couponValue = couponList[couponName]
    // Click the label containing the table using evaluate
    await page.evaluate((couponValue) => {
      const selector = `input[type="radio"][value="${couponValue}"] + .usingPointToggle .couponTableBox`;
      document.querySelector(selector).click();
    }, couponValue);
    console.log("'" + couponName + "' coupon name has been selected");
    // await new Promise((resolve) => setTimeout(resolve, 2000));
     
    // await page.waitForXPath(
    //   '//*[@id="couponLinkForm"]/div[2]/a[2]'
    // );
    // console.log("check confirm button");
    // const confirmButton = await page.$x(
    //   '//*[@id="couponLinkForm"]/div[2]/a[2]]'
    // );
    // // console.log("confirmButton", confirmButton);
    // await inputElement[0].click();

    await page.evaluate(() => {
      const xpath = '//*[@id="couponLinkForm"]/div[2]/a[2]'; // Your XPath expression
      const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      element.click();
    });

    // Wait for a short time to ensure the click event is processed
    // await page.waitForTimeout(1000);
    console.log("confirm button is clicked");
    console.log("wait");
    await new Promise((resolve) => setTimeout(resolve, 1000));
};

// do register function
const doRegister = async (browser, page, data) => {

    const register_button = await page.$x(
      "/html/body/div[2]/div/table[3]/tbody/tr/td[2]/a/img"
    );

    // await new Promise((resolve) => setTimeout(resolve, 1000));
    await register_button[0].click();
    console.log("register ok");

    await new Promise((resolve) => setTimeout(resolve, 5000));

    // check pop up page
    let errorUrl = "https://salonboard.com/BNS/SALON/48/H000641748/";
    const pages = await browser.pages();
    for (const page of pages) {
        // Check if the page URL contains the specified substring
        if (page.url().includes(errorUrl)) {
          // Close the page
          await page.close();
          console.log(`Popup page "${errorUrl}" closed successfully.`);
          return false;
        }
    }
    return true;
}

// const closePopUp = async (browser, page) => {
//     const pages = await browser.pages(); // get all open pages by the browser
//     const popup = pages[pages.length - 1];
//     await popup.close();
//     console.log("Pop up page is closed.");
//     return page;
// }

let closeErrorPage = async (browser) => {
    // Get all open pages in the browser
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const pages = await browser.pages();
    // Count pages in the browser
    const pageCount = (await browser.pages()).length;
    console.log(`Total pages in the browser: ${pageCount}`);
    const popup = pages[pageCount.length - 1];
    let errorUrl = "https://salonboard.com/BNS/SALON/48/H000641748/error_L199256142.html";
   
    if (popup.url() === errorUrl) {
        // Close the page
        await popup.close();
        console.log(`${errorUrl} closed successfully.`);
        return; // Exit the function after closing the page
    }
    console.log(`No page found with URL ${errorUrl}.`);
}

const reflectTop = async (page) => {
    
    // go to reflecttop page
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await page.goto('https://salonboard.com/CNB/reflect/reflectTop/', {waitUntil: 'networkidle0'});
    
    // click the button
    await page.click('input#reflectedButton');
    console.log("Reflected Button is clicked.");
    await new Promise((resolve) => setTimeout(resolve, 1000));
}
  
// main function
let main = async () => {

    const { browser, page } = await loginProcess();

    // fetch data from api
    let data = await fetchData();

    // Number of retries
    const maxRetries = 10;

    for (let i = 0; i < data.length; i++) {
        let retryCount = 0;
        let registerStatus = false;

        while (retryCount < maxRetries || registerStatus === false) {
            try {
                console.log("===================================================================");
                console.log("Item #" + i);
                await stylistInputs(page, data[i]);
                await hairFaceType(page, data[i]);
                await clickCoupon(page, data[i]);
                await retryUpload(page, null, null, data[i]['selectedImage1'], '//*[@id="FRONT_IMG_ID_IMG"]', 5);
                
                if (data[i]['selectedImage2'] !== "null") {
                  await retryUpload(page, 2, data[i]['front1'], data[i]['selectedImage2'], '//*[@id="SIDE_IMG_ID_IMG"]', 5);
                };

                if (data[i]['selectedImage3'] !== "null") {
                  await retryUpload(page, 3, data[i]['front2'], data[i]['selectedImage3'], '//*[@id="BACK_IMG_ID_IMG"]', 5);
                }

                registerStatus = await doRegister(browser, page, data[i]);
                // await closeErrorPage(browser);

                // Break out of the loop if successful
                if (registerStatus === true) {
                    await reflectTop(page);
                    break;
                };
            } catch (error) {
                // Log the error
                console.error(`Error processing Item #${i}: ${error.message}`);

                // Increment the retry count
                retryCount++;

                // Retry after a delay (you can adjust the delay as needed)
                console.log(`Retrying in 3 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // If still unsuccessful after max retries, handle accordingly (e.g., log or throw an error)
        if (retryCount === maxRetries) {
            console.error(`Failed to process Item #${i} after ${maxRetries} retries. Skipping to the next item.`);
        }

        if (i === data.length-1) {
            i = -1
        }
    }

  // Close browser when done
  // await browser.close();
}

main();
