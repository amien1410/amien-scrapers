// https://www.vinted.co.uk/api/v2/my_orders?type=purchased&status=all&per_page=20&page=2
// https://www.vinted.co.uk/api/v2/my_orders?type=purchased&status=in_progress&per_page=20&page=1"
// https://www.vinted.co.uk/api/v2/my_orders?type=purchased&status=completed&per_page=20&page=1
// https://www.vinted.co.uk/api/v2/my_orders?type=purchased&status=canceled&per_page=20&page=1
// https://www.vinted.co.uk/api/v2/transactions/17275949793/shipment/journey_summary
const cookie = "v_udt=dmdQMGdKeG13K3gwTzZMZXcvUjFrKzJXdVF4Yy0tS2kzZk04enlTaVRCMmpoNC0tWFJzSzhMT3YxaWpuT2psZmlSd1BwQT09; anonymous-locale=en-uk-fr; non_dot_com_www_domain_cookie_buster=1; is_shipping_fees_applied_info_banner_dismissed=false; anon_id=77d64760-c671-48b6-b792-dd8f1ecfcd00; v_uid=85672940; v_sid=561b6250-1767187319; domain_selected=true; __cf_bm=bylr1pKmhP6nHhD1kmivGvtkQHXSOERENlh0JO_cnhA-1767361523-1.0.1.1-2zWAhbcUUueGOkCJSDQnJytxqWKCUTtnKqPYzPoRgY9iBF5fz15ohqaeKerFEwBAVsLMD2kQTsfBplyn42R9PfILmHCpcUqCKWHE96D22XKdzVViUONVQ0XR79SfQP0a; cf_clearance=uXV9ChhPIOKodZu5TbNheDBCA9gLJJLRa8R_guPyUVw-1767361529-1.2.1.1-DcfkgHlgS8ovzBfZb4H9DjYcjgnlgZKrWxcjI6q3iwTFD8HyZXsoMxddih7vBnKFsKoX.8_BNmvLkpgvN4nJg_t_eAy_BAuQm8P.lQ0ul7w6DSHgh8yYm45lq4UlweBL1U1aTW7nTPVxmwfsLDBbesUK38oOfiA74Ti8T7txrTuEzpAwkyO0ampFonDKAyjvzaAc_xA_E9Bl8vxDmH7VySPMt14lPl0h1V.hsZ5ENhc; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhY2NvdW50X2lkIjozMTMxNTUwMzE3LCJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzY3OTY2MzI5LCJpYXQiOjE3NjczNjE1MjksImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJyZWZyZXNoIiwic2NvcGUiOiJ1c2VyIiwic2lkIjoiNTYxYjYyNTAtMTc2NzE4NzMxOSIsInN1YiI6Ijg1NjcyOTQwIiwiY2MiOiJVSyIsImFuaWQiOiI3N2Q2NDc2MC1jNjcxLTQ4YjYtYjc5Mi1kZDhmMWVjZmNkMDAiLCJhY3QiOnsic3ViIjoiODU2NzI5NDAifX0.Sw8jUnFwFm5mtFH1U2BRQ1SOF2iG4-IWhh5ZIDaQw4iEnhf6Bazv9igzWzocWJKf5fjISHPoN1coOhwB-CK0cIw6uJNPPft1g2lHY_j2ezDua59AwFS7NXoTRBXr2coXRjgWLj1Tybejt1nYnVJ7z7FuYFbNE4MU6f8cZaV0h_XDVIICZjmnAbNexa_ynyBN2IK4U6AIFlB5DQKZoWKgbEnkh7MBiRwLTkd2h0EYgX6dwKDbxrvtYpe3kc_vSb8n-xCmzPUaPdRfwsMJhJLQYClsTa8gu29uGJ43IIyglwwmYd0IoyUOfndLcqcS97RQnMBMSh4PDpm6ekAvRFJpyA; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhY2NvdW50X2lkIjozMTMxNTUwMzE3LCJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzY3MzY4NzI5LCJpYXQiOjE3NjczNjE1MjksImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJhY2Nlc3MiLCJzY29wZSI6InVzZXIiLCJzaWQiOiI1NjFiNjI1MC0xNzY3MTg3MzE5Iiwic3ViIjoiODU2NzI5NDAiLCJjYyI6IlVLIiwiYW5pZCI6Ijc3ZDY0NzYwLWM2NzEtNDhiNi1iNzkyLWRkOGYxZWNmY2QwMCIsImFjdCI6eyJzdWIiOiI4NTY3Mjk0MCJ9fQ.zC772QIcGEFMLQ8Qve96HAQb9SIDpTXH6Gz7HN1R85HDwcFUMQpmlNK7rn9EjB_i8cn5vovao87BoEpPGWNNaR9lEGdsR_nDEAOX2K4wjxfGs6l3QTsLSGuzp3lsD51inFBlvozbOaID457CMMc_ZEngsDlMvnLJ8EKO8hj1-VjniptRZnG2_4kyMYWLROGE9tNDd3AcI-uvFNyI2WF9TBU92VRWXg8Hw6UHD8RthmSiXs92I8rLbg0fcXZuvZop2aJ7e4IjfKJYc9uNIW0_er4mtgKzs6DYbOez_-bX6cQvdl3vpoRtf2t9YUhMHh4vxn-5X0dT6j0a3eD8fansuA; datadome=0MKPZIq9oionvo29lCyKQcQS~9muQO5B2mK61q5OPIWXK5EnIvakBBwlwp~Vr2_PMaabdVM~vve9hvHUxj64ZXinQclhnjFqTwnPH4NwBgGGrEsWTebu78_U9KUya0_e; viewport_size=786; _vinted_fr_session=cVBZYnZqdXpUMy90TWprdk5DTGF3aE1tdEFXL2M5Z3pQb2xlcGJjYit3RHlqOVBvUFB3ZlN6MHF0R3JsMi96QnZwZlpydkdEblB4NWF4WDZRRTZUSzNMWlJEa08wZzBGNkRQZ2R3NThBMmlTY3MwSDUzOHZ0dkNnVHd2SjlJRFpza0xkNkxvTFBMUE1aSTlaZFlWQSt0akhPdHRuZENvZ2t0cUR0SXRHWm1SUWxaK2dDQ2FyamZVVVJodVA3Zmt5OGNZVk1qV2I2dUJ2TExCVXlETE5iU0MzekcwZ2RTbjhDeUlrVktUSXo4K0pBWDN4NExidG5MOTl6aHFjUS9pLzhkeVU3SlNwSzEzUVNDTk11ekY0dmpxdUxxQUlmblJtQWhkemdNTGJWeUxlbHRLc3dOMzJDWU5SSTZrVVVhTGpLTS90SWRCTkpNN0RUUHVkZTMxMW54NUJ6SDY4UjdKU2FyZitpNHlQTE5CRWR0YkZtcDdyTFNBemQyNi94K3Y5LS1FRWg2OC96OG5BbFdxcXQ0RGFXMndBPT0%3D--a60b229be0a538c0886ae084b0541cec3d462f65; ab.optOut=This-cookie-will-expire-in-2027";

function getOrders() {
  const baseUrl = "https://www.vinted.co.uk/api/v2/my_orders";
  const params = {
    type: "purchased",
    status: "in_progress",
    per_page: 20
  };

  const headers = {
    "accept": "application/json, text/plain, */*,image/webp",
    "accept-language": "en-uk-fr",
    "cookie": cookie,
    "referer": "https://www.vinted.co.uk/my_orders?order_type=purchased",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
    "x-anon-id": "77d64760-c671-48b6-b792-dd8f1ecfcd00",
    "x-csrf-token": "75f6c9fa-dc8e-4e52-a000-e09dd4084b3e",
    "x-money-object": "true",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin"
  };

  const options = {
    method: "get",
    headers,
    muteHttpExceptions: true,
    followRedirects: true
  };

  let page = 1;
  let totalPages = 1;
  const results = [];

  try {
    do {
      const url =
        baseUrl +
        "?type=" + params.type +
        "&status=" + params.status +
        "&per_page=" + params.per_page +
        "&page=" + page;

      const response = UrlFetchApp.fetch(url, options);
      const statusCode = response.getResponseCode();
      // const allHeaders = response.getAllHeaders();
      // Logger.log(allHeaders);
      if (statusCode !== 200) {
        throw new Error("Request failed with status " + statusCode);
      }

      const json = JSON.parse(response.getContentText());

      const orders = json.my_orders || [];

      orders.forEach(order => {
        results.push({
          conversation_id: String(order.conversation_id),
          transaction_id: String(order.transaction_id),
          title: order.title,
          price: order.price ? order.price.amount : null,
          status: order.status
        });
      });

      totalPages = json.pagination?.total_pages || 1;
      page++;

    } while (page <= totalPages);

    Logger.log("Total orders fetched: " + results.length);
    Logger.log(results);

    return results;

  } catch (err) {
    Logger.log("❌ Failed to fetch orders");
    Logger.log(err);
    throw err;
  }
}

function getItemUrl() {
  const url = "https://www.vinted.co.uk/api/v2/conversations/19929346371";
  const headers = {
    "accept": "application/json, text/plain, */*,image/webp",
    "accept-language": "en-uk-fr",
    "cookie": cookie,
    "referer": "https://www.vinted.co.uk/my_orders?order_type=purchased",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
    "x-anon-id": "77d64760-c671-48b6-b792-dd8f1ecfcd00",
    "x-csrf-token": "75f6c9fa-dc8e-4e52-a000-e09dd4084b3e",
    "x-money-object": "true",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin"
  };

  const options = {
    method: "get",
    headers,
    muteHttpExceptions: true,
    followRedirects: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();

    if (statusCode !== 200) {
      throw new Error("Request failed with status " + statusCode);
    }

    const json = JSON.parse(response.getContentText());

    const data = typeof json === "string"
      ? JSON.parse(json)
      : json;

    const transaction = data?.conversation?.transaction;
    const oppositeUser = data?.conversation?.opposite_user;

    if (!transaction) {
      throw new Error("Transaction data not found");
    }

    const result = {
      item_url: transaction.item_url || null,
      offer_price: transaction.offer_price?.amount || null,
      service_fee: transaction.service_fee?.amount || null,
      total_amount_without_tax: transaction.total_amount_without_tax?.amount || null,
      seller_city: transaction.seller_city || null,
      seller_login: oppositeUser?.login || null
    };
    Logger.log(result);

    return result;

  } catch (err) {
    Logger.log("❌ Failed to fetch item url");
    Logger.log(err);
    throw err;
  }
}

function testVintedConnection() {
  // const url = "https://www.vinted.co.uk/api/v2/my_orders?type=purchased&status=in_progress";
  // const url = "https://www.vinted.co.uk/api/v2/conversations/19929346371";
  // const url = "https://www.vinted.co.uk/api/v2/transactions/17275949793/shipment/journey_summary";
  const url = "https://www.vinted.co.uk/my_orders?order_type=purchased";

  const headers = {
    "accept": "application/json, text/plain, */*,image/webp",
    "accept-language": "en-uk-fr",
    "cookie": cookie,
    "referer": "https://www.vinted.co.uk/my_orders?order_type=purchased",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
    "x-anon-id": "77d64760-c671-48b6-b792-dd8f1ecfcd00",
    "x-csrf-token": "75f6c9fa-dc8e-4e52-a000-e09dd4084b3e",
    "x-money-object": "true",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin"
  };

  const options = {
    method: "get",
    headers: headers,
    muteHttpExceptions: true,
    followRedirects: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const allHeaders = response.getAllHeaders();
    const statusCode = response.getResponseCode();
    const body = response.getContentText();

    Logger.log("Status Code: " + statusCode);
    Logger.log("Response Body:" + body);
    Logger.log(allHeaders);

    // return {
    //   status: statusCode,
    //   bodyPreview: body
    // };

  } catch (err) {
    Logger.log("Request failed:");
    Logger.log(err);
    throw err;
  }
}

// function testVintedItemPage() {
//   const url = "https://www.vinted.co.uk/items/7839806212-barbour-boxy-jacket";

//   const headers = {
//     "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
//     "accept-language": "en-US,en;q=0.9,id;q=0.8,fa;q=0.7,ar;q=0.6,ms;q=0.5,ja;q=0.4,es;q=0.3",

//     // VERY IMPORTANT: paste the full cookie string as-is
//     "cookie": "v_udt=alM2d2dIeUxGOTZqZ2NVS29haEEvMGwwWWJreS0tQUpTdnBXWE9xRzQycERtQS0tQklmMjZ3bXJnUGhVendjdWtZem5idz09; anon_id=48293372-ce2f-4340-b60a-6bc17f82fece; anonymous-locale=en-uk-fr; non_dot_com_www_domain_cookie_buster=1; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzY3Nzk2MDU0LCJpYXQiOjE3NjcxOTEyNTQsImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJyZWZyZXNoIiwic2NvcGUiOiJwdWJsaWMiLCJzaWQiOiIwZjNkNGVlNy0xNzY3MTkxMjU0In0.Xqme_x19qmHS7dWFbf60DN7oeS66ygrqpmV2lTEsafw_2zkmlX37rLpVfiXizj06j6jvnDa7_Qw79JbuyguM_e5QxQZdNdIpw-I0Xm2nzv8yaW-wYfVFEoSUYjo9PPg-WBlgcsipbQ9-ioYzNo_NA4Vxuja79yLNxcn8xznACsf_zFB_5VXGW_0yWFmrUpja5wMh1wsHM8Ji9CNQtdomVPwgnj07hU_cJ2KnGLJ-TOVUMpejQ-MRtkLLijvmz88IJugIG_566W2uYn-7IeVjycY_bT60I1ijtZtaWR8Ez7hmkXNrbAEeMOsr3ucsy4zBuioDh_Bg4IHM-v_IpVpb0A; access_token_web=; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzY3MTk4NDU0LCJpYXQiOjE3NjcxOTEyNTQsImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJhY2Nlc3MiLCJzY29wZSI6InB1YmxpYyIsInNpZCI6IjBmM2Q0ZWU3LTE3NjcxOTEyNTQifQ.tfGoPHEo6jS_YIiChsTfWvW3iU3CS7ydTwUkBmU-nQxcYJ9xEEP8yPeBwWvkHyByST-DXGWw-jlSb25NJgEjKqxHyv1atD_MFgOp9iJL8xkXJRka3rNzKC-i5jZj_9F7g1T7blzf0LulqRPPiqAx8-nt8unt8j-4EWR3REJJowmeG0tYFQfmnqFGxMuEQkSNXI7zi_Kw9rrcmdAvROPkSOaijCK8LsyF6eGQO9zDZLIN6Ch252o0c24Ki_X9NtIdBDWLpryULp0p1JDkCWm4rrjC4rAlnrTOOPld4s0mGuSxrWavRUXSlpPH2R_rVD3VMD6H57GBJpsMdjOlmR9U4A; datadome=; __cf_bm=M4lDvB5AkdaKMlDd5tff4ONAd0nz_dFaANKfwbKne5Y-1767191254-1.0.1.1-VXweDNsYWY34IMQYP435y2wDTByc86rwEc4flKkQ0020xgK.t8vNh4jUIXsGm6wtcHnw04h0bwrS3hUZe2L58.CaQqSDmSBFTmGaITHdGgtTF9hggOum3ZCJxxKiEico",

//     "referer": "https://www.vinted.co.uk/inbox/19929346371",
//     "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",

//     "sec-ch-ua": "\"Microsoft Edge\";v=\"143\", \"Chromium\";v=\"143\", \"Not A(Brand\";v=\"24\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"Windows\"",

//     "sec-fetch-dest": "document",
//     "sec-fetch-mode": "navigate",
//     "sec-fetch-site": "same-origin",
//     "upgrade-insecure-requests": "1"
//   };

//   const options = {
//     method: "get",
//     headers: headers,
//     followRedirects: true,
//     muteHttpExceptions: true
//   };

//   const response = UrlFetchApp.fetch(url, options);
//   const status = response.getResponseCode();
//   const html = response.getContentText();

//   Logger.log("Status Code: " + status);
//   // Logger.log("HTML Length: " + html.length);
//   // Logger.log("Content: " + html);

//   return {
//     status: status,
//     htmlLength: html.length
//   };
// }

function refreshVintedCookie() {
  const url = "https://www.vinted.co.uk/";

  const headers = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "accept-language": "en-GB,en;q=0.9",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
    "upgrade-insecure-requests": "1"
  };

  const options = {
    method: "get",
    headers: headers,
    followRedirects: true,
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);

  // GAS returns all headers as a map
  const allHeaders = response.getAllHeaders();

  let cookies = [];

  // `Set-Cookie` may be string or array
  const setCookie = allHeaders["Set-Cookie"] || allHeaders["set-cookie"];

  if (setCookie) {
    if (Array.isArray(setCookie)) {
      cookies = setCookie.map(c => c.split(";")[0]);
    } else {
      cookies = setCookie.split(",").map(c => c.split(";")[0]);
    }
  }

  const cookieString = cookies.join("; ");

  Logger.log("Refreshed Cookie:");
  Logger.log(cookieString);

  return cookieString;
}

function testVintedItemPage() {
  const url = "https://www.vinted.co.uk/items/7839806212-barbour-boxy-jacket";

  function buildHeaders(cookie2) {
    return {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9,id;q=0.8,fa;q=0.7,ar;q=0.6,ms;q=0.5,ja;q=0.4,es;q=0.3",
      "cookie": cookie2,
      "referer": "https://www.vinted.co.uk/inbox/19929346371",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
      "sec-ch-ua": "\"Microsoft Edge\";v=\"143\", \"Chromium\";v=\"143\", \"Not A(Brand\";v=\"24\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "upgrade-insecure-requests": "1"
    };
  }

  let cookie2 = "v_udt=dmdQMGdKeG13K3gwTzZMZXcvUjFrKzJXdVF4Yy0tS2kzZk04enlTaVRCMmpoNC0tWFJzSzhMT3YxaWpuT2psZmlSd1BwQT09; anonymous-locale=en-uk-fr; non_dot_com_www_domain_cookie_buster=1; is_shipping_fees_applied_info_banner_dismissed=false; viewport_size=786; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhY2NvdW50X2lkIjozMTMxNTUwMzE3LCJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzY3NzkyMTE5LCJpYXQiOjE3NjcxODczMTksImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJyZWZyZXNoIiwic2NvcGUiOiJ1c2VyIiwic2lkIjoiNTYxYjYyNTAtMTc2NzE4NzMxOSIsInN1YiI6Ijg1NjcyOTQwIiwiY2MiOiJVSyIsImFuaWQiOiI3N2Q2NDc2MC1jNjcxLTQ4YjYtYjc5Mi1kZDhmMWVjZmNkMDAiLCJhY3QiOnsic3ViIjoiODU2NzI5NDAifX0.KMY7uCoVijNSK0cdtFmDses87AQXGno68jTwfLgEpXbYqvc_Xis7yEeU9yHhXa9zjffkA7W7le7Xe0YrOWsyeU6XeUlpLYK58XMVJ_RmQs2iZXHpiyyi5ctaOa0sEuyjQ3x3dpyewFJ34PGuSzIYE_k4TDH7D_zLc9cWXFvnDEqHgyvcjxDdtdp2IsdpT610M38U9GA89JJDSDS7YTt41IKfBA8BPwZrzPO6PGhyzKNOmRVBEzjSHP17ercx6ge00euA1cJnlFUMkLiTfPtGrjB_2IVRscK2MnO21kYrPXHHZG4TPmoE-8IvyICBfFubE_R8LXm9BAiKiF46hKq4Hg; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhY2NvdW50X2lkIjozMTMxNTUwMzE3LCJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzY3MTk0NTE5LCJpYXQiOjE3NjcxODczMTksImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJhY2Nlc3MiLCJzY29wZSI6InVzZXIiLCJzaWQiOiI1NjFiNjI1MC0xNzY3MTg3MzE5Iiwic3ViIjoiODU2NzI5NDAiLCJjYyI6IlVLIiwiYW5pZCI6Ijc3ZDY0NzYwLWM2NzEtNDhiNi1iNzkyLWRkOGYxZWNmY2QwMCIsImFtciI6WyJtZmEiLCJzbXMiXSwiYWN0Ijp7InN1YiI6Ijg1NjcyOTQwIn19.JnORTOpGC12iioP_mvhNJiU_P1Xf5Y2HoHWHe1W3dRlu2-D4Awo2FL0TdpVRXJxDDYAKKSC-aaSqbZ6ylsym7csPfnvJbaVVTxK1oEAls2RJ_IjU4PPzYBFYT-gLgK-08wKF1usLMBK59yYbpm_wgKeyIOz_NkUNRJxMyGCdd6Zsceb-M1dSkEMMo77CEQQzOlrB7w-Ods9oOEXFEzPZWx99sl-tX7HZP8-xoZRminqzJbfcKGzeYF1qnUbGFHsPiPrs0hyo11fDEIQbYxyUJ8bYUrBH5VWAu9_DMFdKNmffTqN8yUvN0tSsagcslN74UUikxuVvLxeBh4fMFtdyKw; anon_id=77d64760-c671-48b6-b792-dd8f1ecfcd00; v_uid=85672940; v_sid=561b6250-1767187319; domain_selected=true; cf_clearance=Ze3GlTUfwQZuen1lf4qHYXsVeteBA9lVhG0reEPLNhQ-1767188992-1.2.1.1-S1Dv1zJXRF2rtK.1QyQfGEKC4vwJbpY.Yl8k7iab8kDjvyBSm0yM07OabZ_yBwdj_K0lN2xwBCdZP3tB7FphdHzkn0lFJB6TGS4GPwpzGeGZJuMZNWjhuNN1j0ywGhpFdfssym8NIMwiuQ68UlS6xNgN2ZVPD0qOYMZSlIHTTFYybHwjIO5K22kyX2u_kacqkgFrhBdziz_9RLL4hge6p_Uyu0zEbQu311Sy41t5vmI; datadome=lPdyruDM7MIy393N_4~R~83xOVcUtJnKjHz8jSJdDsvKEno_p3QskG9HMVuPH1DkzHgnhTg5gCG_5ih1MQe0DrUIL5yTgT_gK~X9fsVa80Eh4KK0l3faoUHE~zB8Frs4; _vinted_fr_session=L0tNSzhZL2JtV09oYmpERmJZY3FrWVdpOTgrWVhFN1ZHcXdacTAxVHBIanYrUFJydWpvUnlvKzFGYk1OODR0cmQrOGw2azYra1JDZjQyU2xvd2ZzK1hzY1NGZ09pUFZINEpsdkdQcVJyWi9WcW02TXE0N044cm16ZmlvaDJQaEQrbktQM1AzT0pOQXViWDFXL2FmR0szQ3ZWNGIrQ0xheFBjR1huVGM5OXhuVzRMc3hGajU1N2QrRittWjRkSFRIWjRWU2RhaEt5ck1NT2pobmM2aXo5ZkNZMWJ5R1kxa0RiMlgzeHUwZU4vMzFHRUhGa3Y4azZPSkVtbDlhL2xzbGVLZHFBTFRDK3VEVEczVkphcG0yWHFib0p4dG10aHd4ZHdROVBqNWdMS2hseXhkbTY3SHQzL2RkMGdPeUJBMitJRkNMZlV3eXJrelQ5OVlySzFJZGphR2lSSTVLU1lFV2Y4WDVoZDY2V3RpQUZVWE0xSjNiSUk4THRkcDRHMGtPLS1lN2dSY3lHVmRhNEVqM3Izc2ZPQUFBPT0%3D--95f14c64a416b7e0852777ab38d95ddac55ff534";

  function fetchOnce(cookieValue) {
    return UrlFetchApp.fetch(url, {
      method: "get",
      headers: buildHeaders(cookieValue),
      followRedirects: true,
      muteHttpExceptions: true
    });
  }

  // First attempt
  let response = fetchOnce(cookie2);
  let status = response.getResponseCode();

  // If failed → refresh cookie and retry once
  if (status === 400 || status === 401 || status === 403) {
    Logger.log("Request failed with status " + status + ", refreshing cookie...");

    cookie = refreshVintedCookie();
    response = fetchOnce(cookie);
    status = response.getResponseCode();
  }

  const html = response.getContentText();

  Logger.log("Final Status Code: " + status);
  Logger.log("HTML Length: " + html);

  return {
    status: status,
    htmlLength: html.length,
    refreshed: status !== 200
  };
}


function refreshVintedSessionToken() {
  const url = "https://www.vinted.co.uk/session-refresh?ref_url=%2Fmy_orders";

  const options = {
    method: "get",
    followRedirects: true,
    muteHttpExceptions: true,
    headers: {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "en-GB,en;q=0.9",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
      "upgrade-insecure-requests": "1",
      // optional but helps when already logged-in
      "cookie": "v_udt=dmdQMGdKeG13K3gwTzZMZXcvUjFrKzJXdVF4Yy0tS2kzZk04enlTaVRCMmpoNC0tWFJzSzhMT3YxaWpuT2psZmlSd1BwQT09; anonymous-locale=en-uk-fr; non_dot_com_www_domain_cookie_buster=1; is_shipping_fees_applied_info_banner_dismissed=false; anon_id=77d64760-c671-48b6-b792-dd8f1ecfcd00; v_uid=85672940; v_sid=561b6250-1767187319; domain_selected=true; __cf_bm=xi7eDdKMsWu1Euaa8e.gRt2TZGxjIGrv5waQEZeISLw-1767254466-1.0.1.1-wo2hTHzQ3aAYEV4NbtlwTYO1CIXsEMazUt9nzCgBvlEWwC6Qxvn2p_ObHip2uAjM8w4cRUjRsJa30eqVNLrVOqGCiBHESQLwSP5nFgcckvb2OfgWOMkuwMRF5GDkGx2w; cf_clearance=D1NhRv2xWC978_BomhQfCP30uHu9EeRJQWOAP06RW2o-1767254470-1.2.1.1-Fz_0W6BVqinyJrFBRiozrT7noqqCbDZCsV7e.v7J97BmshdlxijAe7lCkZuWc3Gwgrg6wq8jeb8sjgRRRhZrwld_1w.xqep0wXpEIKcS1DDbKMWrjlT0oWF8tc6WR_q0JWryDi1BSyoh.MdxXkx.osaMMM3oR49NbupQddY8yLj83oveAbovgEUJl3F78WXyzI3BS9Fn6Z0hlQOaMBTo2heYOAHkR1nmkQ3yI_pE4aY; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhY2NvdW50X2lkIjozMTMxNTUwMzE3LCJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzY3ODU5MjcxLCJpYXQiOjE3NjcyNTQ0NzEsImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJyZWZyZXNoIiwic2NvcGUiOiJ1c2VyIiwic2lkIjoiNTYxYjYyNTAtMTc2NzE4NzMxOSIsInN1YiI6Ijg1NjcyOTQwIiwiY2MiOiJVSyIsImFuaWQiOiI3N2Q2NDc2MC1jNjcxLTQ4YjYtYjc5Mi1kZDhmMWVjZmNkMDAiLCJhY3QiOnsic3ViIjoiODU2NzI5NDAifX0.pkxRjrcJAjIpwqcfRA9X8yfT4HfCA4x13tAluVvH_EI6FfpL3QjCvERrvR_ZCaVHLTlsF94EJS99tJcB3Jp1AEbbv8NU_-hZ4JpKBgeBI_N7lKdq2c7cn1gzGzL5luIpaerFk4vy_VoX4tugIx1nV2wOIMUZr_vfDkachPUFsHaWmWgUL7Xr7GRnZzGSlPzePKzgAThpMtf__--C3T7CA3rUO1rmQGNJyQDFS4VucK-h0zGy3aVUKe48dPg09cK-BoaAdF6MoqNJKFfAVZqGLI9VgtXtnjBZwFKQ5GUYRJiFDHl8FPVAXOd0c1jIL5nsYXaviFpHgsh-ANBaUq7CDQ; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhY2NvdW50X2lkIjozMTMxNTUwMzE3LCJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzY3MjYxNjcxLCJpYXQiOjE3NjcyNTQ0NzEsImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJhY2Nlc3MiLCJzY29wZSI6InVzZXIiLCJzaWQiOiI1NjFiNjI1MC0xNzY3MTg3MzE5Iiwic3ViIjoiODU2NzI5NDAiLCJjYyI6IlVLIiwiYW5pZCI6Ijc3ZDY0NzYwLWM2NzEtNDhiNi1iNzkyLWRkOGYxZWNmY2QwMCIsImFjdCI6eyJzdWIiOiI4NTY3Mjk0MCJ9fQ.bdNlyuB6IbgXtfcp5t_qFIOgNyEZeFbOMTl0F2CUOjF0wYmfMO_TdvjzsIzqFmALg-5FgqwJ1ox2MHs0dPrT44xVoXd7dhaRv0OYEbH5zZE0VlTA6pT32dZGQI9s_qlLv4HHHiFUzEOqN2MKzQxK5ygvc3lDPKdEU9or355NmGumSuT2Wygp7MxHEmin8rOa8RXGr6Q1m0z9a3hkNauopRIXY3id5U6rixd3ZE9juhQkflwuIsTNAp1cuNN3iVcxU87NzmKfy7f4_MGl6YT__zXW3QyZ-Pj8WaSOammUI-CHlR-mgiNB8sdHrMeNfeBATa_13zMtt4IwTFjhuyBwtg; viewport_size=786; _vinted_fr_session=VXBuM2FGc3oyVkVHUVEyZ0s1NE5OeUpuUkhSQzVDUkJpSCtjeHExdzlQRzRoK1pwMUwxSnFEd2NOTUFLa21WdVR2M3VHdFVzK1hvOGhQZ3pIb0VVU1R6Qi80ekhCT0lXN3RKWkVseUFFS0x1Y3hXOEN5WXNCZll5STZZK2lTQTlmMldyemdiVkdQTkpWWnRzZTROQm44YWdSeUIrNzB3TUY5aXhlVFZYZnNQM0xoSWhxblo3ak45V0lrVGVxVFJ3QlE4anVDY0Z0Wlh1azBaQm1yaVZjLzRMeE5KZ2ZsclpySTVudW5MMXZQY0JvUURMcDJpWFR5RlNXa2pSSTJJMlRDU21xV1I2MWh0cmFlVEdmdEh6a2FKSnpxZDhKcWlhK0NNNkl4L0dCVG5YU0FMdVM2cWFFWlkwOWRiamppK1NicjEySnlqNERFeTczMHQyT3ZJK202ZWQ3VnlwcmJ0TTQ0Nk9DTHN3L3BNWjJpcHA3SG5NVXd1UVhFbUEwMGlvLS1ZeUtDaEFBWlh3UVVrV2pKOExUcWZRPT0%3D--8e5745462c73039feb4b927c0feb7ef8f770094d; datadome=ugAI4PEAXGOBM23OsfkGNEySQ1IEKnhj9GW3h_zYm23GbiCJ_9nDaX9ie1r~ZFtQpZVZ7beQMoRJ4VYsN3uyQDbvBDImMusQUeg5aeWY2iYpKuj~1rKXxrWyaQiewZxQ"
    }
  };

  const response = UrlFetchApp.fetch(url, options);
  const status = response.getResponseCode();
  Logger.log("===================================");

  const headers = response.getAllHeaders();

  // Log each header clearly
  Object.keys(headers).forEach(key => {
    const value = headers[key];

    if (Array.isArray(value)) {
      value.forEach(v => {
        Logger.log(key + ": " + v);
      });
    } else {
      Logger.log(key + ": " + value);
    }
  });

  Logger.log("===================================");

  Logger.log("Session refresh status: " + status);

  const setCookie = headers["Set-Cookie"] || headers["set-cookie"];
  if (!setCookie) {
    Logger.log("No Set-Cookie header returned.");
    return null;
  }

  // Normalize cookies
  const cookieArr = Array.isArray(setCookie)
    ? setCookie
    : setCookie.split(/,(?=[^;]+?=)/);

  const cookies = {};
  cookieArr.forEach(c => {
    const pair = c.split(";")[0];
    const idx = pair.indexOf("=");
    if (idx > -1) {
      const k = pair.slice(0, idx);
      const v = pair.slice(idx + 1);
      cookies[k] = v;
    }
  });

  const accessToken = cookies["access_token_web"] || null;
  const refreshToken = cookies["refresh_token_web"] || null;

  const cookieString = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");

  // 🔍 Logs
  Logger.log("New access_token_web: " + (accessToken ? accessToken.substring(0, 40) + "..." : "NOT FOUND"));
  Logger.log("New refresh_token_web: " + (refreshToken ? refreshToken.substring(0, 40) + "..." : "NOT FOUND"));
  Logger.log("Cookie: " + headers);

  return {
    status: status,
    access_token_web: accessToken,
    refresh_token_web: refreshToken,
    cookie: cookieString
  };
}

function runandsavethelogs() {
  const url = "https://www.vinted.co.uk/api/v2/my_orders?type=purchased&status=in_progress";
  const MAX_RETRIES = 3;

  let status = null;
  let results = [];
  let lastTransactionId = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    Logger.log(`🔁 Attempt ${attempt}/${MAX_RETRIES}`);

    try {
      const response = UrlFetchApp.fetch(url, {
        method: "get",
        headers: {
          "accept": "application/json, text/plain, */*,image/webp",
          "accept-language": "en-uk-fr",
          "cookie": cookie,
          "referer": "https://www.vinted.co.uk/my_orders?order_type=purchased",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "x-anon-id": "77d64760-c671-48b6-b792-dd8f1ecfcd00",
          "x-csrf-token": "75f6c9fa-dc8e-4e52-a000-e09dd4084b3e",
          "x-money-object": "true",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin"
        },
        muteHttpExceptions: true,
        followRedirects: true
      });

      status = response.getResponseCode();
      Logger.log(`HTTP Status: ${status}`);

      // Retry only for auth / client failures
      if ([400, 401, 403].includes(status)) {
        Logger.log("⚠ Retriable status detected");
        Utilities.sleep(1000 * attempt); // backoff
        continue;
      }

      // Success → parse response
      const body = response.getContentText();
      const json = JSON.parse(body);
      const orders = json.my_orders || [];

      results = orders.map(order => {
        lastTransactionId = String(order.transaction_id);
        return {
          conversation_id: String(order.conversation_id),
          transaction_id: String(order.transaction_id),
          title: order.title,
          price: order.price ? order.price.amount : null,
          status: order.status
        };
      });

      Logger.log("✅ Success on attempt " + attempt);
      break; // stop retry loop

    } catch (err) {
      Logger.log("❌ Exception occurred:");
      Logger.log(err);

      if (attempt === MAX_RETRIES) {
        status = "ERROR";
      }
    }
  }

  // Save even if empty / failed
  saveStatusToSheet(status, lastTransactionId);

  Logger.log("📌 Final Status:");
  Logger.log(status);
  Logger.log("📦 Results:");
  Logger.log(results);

  return status;
}


function saveStatusToSheet(status, results) {
  const sheetUrl = "https://docs.google.com/spreadsheets/d/1OVkazfkrqYyzcMpXGfUqrZoVyPFY8UtaTLc0TxH9kPY/edit";
  const sheetName = "logs";

  const ss = SpreadsheetApp.openByUrl(sheetUrl);
  const sheet = ss.getSheetByName(sheetName);

  const lastRow = sheet.getLastRow();
  const nextNo = lastRow === 0 ? 1 : lastRow; // assuming header exists

  sheet.appendRow([
    nextNo,
    status,
    results,
    new Date()
  ]);
}

function createTrigger() {
  // Remove existing triggers to avoid duplicates
  ScriptApp.getProjectTriggers().forEach(trigger => {
    if (trigger.getHandlerFunction() === "runandsavethelogs") {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger("runandsavethelogs")
    .timeBased()
    .everyMinutes(5)
    // .everyHours(1)
    .create();

  Logger.log("Trigger installed.");
}

function refreshVintedSession(oldCookie) {
  const refreshUrl =
    "https://www.vinted.co.uk/session-refresh?ref_url=%2Fmy_orders%3Forder_type%3Dpurchased";

  const response = UrlFetchApp.fetch(refreshUrl, {
    method: "get",
    headers: {
      "cookie": oldCookie,
      "user-agent": "Mozilla/5.0"
    },
    muteHttpExceptions: true,
    followRedirects: false // IMPORTANT
  });

  const headers = response.getAllHeaders();
  const setCookie = headers["Set-Cookie"] || headers["set-cookie"];

  if (!setCookie) {
    throw new Error("Session refresh failed — no Set-Cookie returned");
  }

  const newCookie = Array.isArray(setCookie)
    ? setCookie.map(c => c.split(";")[0]).join("; ")
    : setCookie.split(";")[0];

  Logger.log("🔄 Refreshed Cookie:");
  Logger.log(newCookie);

  return newCookie;
}

function isSessionExpired(status, body) {
  return (
    status === 302 ||
    body.includes("session-refresh") ||
    body.includes("login")
  );
}

function mainApp() {
  let oldcookie = cookie;

  const url = "https://www.vinted.co.uk/my_orders?order_type=purchased";

  function makeRequest(cookieValue) {
    return UrlFetchApp.fetch(url, {
      method: "get",
      headers: {
        "accept": "text/html,*/*",
        "cookie": cookieValue,
        "user-agent": "Mozilla/5.0"
      },
      muteHttpExceptions: true,
      followRedirects: true
    });
  }

  let response = makeRequest(oldcookie);
  let status = response.getResponseCode();
  let body = response.getContentText();

  if (isSessionExpired(status, body)) {
    Logger.log("⚠ Session expired — refreshing…");

    oldcookie = refreshVintedSession(oldcookie);
    response = makeRequest(oldcookie);

    status = response.getResponseCode();
    body = response.getContentText();
  }

  Logger.log("✅ Final Status: " + status);
  Logger.log("📄 Body Preview:");
  Logger.log(oldcookie);

  const sheetUrl = "https://docs.google.com/spreadsheets/d/1OVkazfkrqYyzcMpXGfUqrZoVyPFY8UtaTLc0TxH9kPY/edit";
  const sheetName = "logs";

  const ss = SpreadsheetApp.openByUrl(sheetUrl);
  const sheet = ss.getSheetByName(sheetName);

  const lastRow = sheet.getLastRow();
  const nextNo = lastRow === 0 ? 1 : lastRow; // assuming header exists

  sheet.appendRow([
    nextNo,
    body,
    new Date()
  ]);
  return {
    status,
    oldcookie
  };
}


