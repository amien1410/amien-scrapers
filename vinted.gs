// https://www.vinted.co.uk/api/v2/my_orders?type=purchased&status=all&per_page=20&page=2
// https://www.vinted.co.uk/api/v2/my_orders?type=purchased&status=in_progress&per_page=20&page=1"
// https://www.vinted.co.uk/api/v2/my_orders?type=purchased&status=completed&per_page=20&page=1
// https://www.vinted.co.uk/api/v2/my_orders?type=purchased&status=canceled&per_page=20&page=1
// https://www.vinted.co.uk/api/v2/transactions/17275949793/shipment/journey_summary

function testVintedConnection() {
  const url = "https://www.vinted.co.uk/api/v2/my_orders?type=purchased&status=in_progress&per_page=20&page=1";
  // const url = "https://www.vinted.co.uk/api/v2/conversations/19929346371";
  // const url = "https://www.vinted.co.uk/api/v2/transactions/17275949793/shipment/journey_summary";

  const headers = {
    "accept": "application/json, text/plain, */*,image/webp",
    "accept-language": "en-uk-fr",
    "cookie": "v_udt=dmdQMGdKeG13K3gwTzZMZXcvUjFrKzJXdVF4Yy0tS2kzZk04enlTaVRCMmpoNC0tWFJzSzhMT3YxaWpuT2psZmlSd1BwQT09; anonymous-locale=en-uk-fr; non_dot_com_www_domain_cookie_buster=1; is_shipping_fees_applied_info_banner_dismissed=false; anon_id=77d64760-c671-48b6-b792-dd8f1ecfcd00; v_uid=85672940; v_sid=561b6250-1767187319; domain_selected=true; __cf_bm=xi7eDdKMsWu1Euaa8e.gRt2TZGxjIGrv5waQEZeISLw-1767254466-1.0.1.1-wo2hTHzQ3aAYEV4NbtlwTYO1CIXsEMazUt9nzCgBvlEWwC6Qxvn2p_ObHip2uAjM8w4cRUjRsJa30eqVNLrVOqGCiBHESQLwSP5nFgcckvb2OfgWOMkuwMRF5GDkGx2w; cf_clearance=D1NhRv2xWC978_BomhQfCP30uHu9EeRJQWOAP06RW2o-1767254470-1.2.1.1-Fz_0W6BVqinyJrFBRiozrT7noqqCbDZCsV7e.v7J97BmshdlxijAe7lCkZuWc3Gwgrg6wq8jeb8sjgRRRhZrwld_1w.xqep0wXpEIKcS1DDbKMWrjlT0oWF8tc6WR_q0JWryDi1BSyoh.MdxXkx.osaMMM3oR49NbupQddY8yLj83oveAbovgEUJl3F78WXyzI3BS9Fn6Z0hlQOaMBTo2heYOAHkR1nmkQ3yI_pE4aY; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhY2NvdW50X2lkIjozMTMxNTUwMzE3LCJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzY3ODU5MjcxLCJpYXQiOjE3NjcyNTQ0NzEsImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJyZWZyZXNoIiwic2NvcGUiOiJ1c2VyIiwic2lkIjoiNTYxYjYyNTAtMTc2NzE4NzMxOSIsInN1YiI6Ijg1NjcyOTQwIiwiY2MiOiJVSyIsImFuaWQiOiI3N2Q2NDc2MC1jNjcxLTQ4YjYtYjc5Mi1kZDhmMWVjZmNkMDAiLCJhY3QiOnsic3ViIjoiODU2NzI5NDAifX0.pkxRjrcJAjIpwqcfRA9X8yfT4HfCA4x13tAluVvH_EI6FfpL3QjCvERrvR_ZCaVHLTlsF94EJS99tJcB3Jp1AEbbv8NU_-hZ4JpKBgeBI_N7lKdq2c7cn1gzGzL5luIpaerFk4vy_VoX4tugIx1nV2wOIMUZr_vfDkachPUFsHaWmWgUL7Xr7GRnZzGSlPzePKzgAThpMtf__--C3T7CA3rUO1rmQGNJyQDFS4VucK-h0zGy3aVUKe48dPg09cK-BoaAdF6MoqNJKFfAVZqGLI9VgtXtnjBZwFKQ5GUYRJiFDHl8FPVAXOd0c1jIL5nsYXaviFpHgsh-ANBaUq7CDQ; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhY2NvdW50X2lkIjozMTMxNTUwMzE3LCJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzY3MjYxNjcxLCJpYXQiOjE3NjcyNTQ0NzEsImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJhY2Nlc3MiLCJzY29wZSI6InVzZXIiLCJzaWQiOiI1NjFiNjI1MC0xNzY3MTg3MzE5Iiwic3ViIjoiODU2NzI5NDAiLCJjYyI6IlVLIiwiYW5pZCI6Ijc3ZDY0NzYwLWM2NzEtNDhiNi1iNzkyLWRkOGYxZWNmY2QwMCIsImFjdCI6eyJzdWIiOiI4NTY3Mjk0MCJ9fQ.bdNlyuB6IbgXtfcp5t_qFIOgNyEZeFbOMTl0F2CUOjF0wYmfMO_TdvjzsIzqFmALg-5FgqwJ1ox2MHs0dPrT44xVoXd7dhaRv0OYEbH5zZE0VlTA6pT32dZGQI9s_qlLv4HHHiFUzEOqN2MKzQxK5ygvc3lDPKdEU9or355NmGumSuT2Wygp7MxHEmin8rOa8RXGr6Q1m0z9a3hkNauopRIXY3id5U6rixd3ZE9juhQkflwuIsTNAp1cuNN3iVcxU87NzmKfy7f4_MGl6YT__zXW3QyZ-Pj8WaSOammUI-CHlR-mgiNB8sdHrMeNfeBATa_13zMtt4IwTFjhuyBwtg; viewport_size=786; _vinted_fr_session=VXBuM2FGc3oyVkVHUVEyZ0s1NE5OeUpuUkhSQzVDUkJpSCtjeHExdzlQRzRoK1pwMUwxSnFEd2NOTUFLa21WdVR2M3VHdFVzK1hvOGhQZ3pIb0VVU1R6Qi80ekhCT0lXN3RKWkVseUFFS0x1Y3hXOEN5WXNCZll5STZZK2lTQTlmMldyemdiVkdQTkpWWnRzZTROQm44YWdSeUIrNzB3TUY5aXhlVFZYZnNQM0xoSWhxblo3ak45V0lrVGVxVFJ3QlE4anVDY0Z0Wlh1azBaQm1yaVZjLzRMeE5KZ2ZsclpySTVudW5MMXZQY0JvUURMcDJpWFR5RlNXa2pSSTJJMlRDU21xV1I2MWh0cmFlVEdmdEh6a2FKSnpxZDhKcWlhK0NNNkl4L0dCVG5YU0FMdVM2cWFFWlkwOWRiamppK1NicjEySnlqNERFeTczMHQyT3ZJK202ZWQ3VnlwcmJ0TTQ0Nk9DTHN3L3BNWjJpcHA3SG5NVXd1UVhFbUEwMGlvLS1ZeUtDaEFBWlh3UVVrV2pKOExUcWZRPT0%3D--8e5745462c73039feb4b927c0feb7ef8f770094d; datadome=ugAI4PEAXGOBM23OsfkGNEySQ1IEKnhj9GW3h_zYm23GbiCJ_9nDaX9ie1r~ZFtQpZVZ7beQMoRJ4VYsN3uyQDbvBDImMusQUeg5aeWY2iYpKuj~1rKXxrWyaQiewZxQ",
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
    const statusCode = response.getResponseCode();
    const body = response.getContentText();

    Logger.log("Status Code: " + statusCode);
    Logger.log("Response Body:");
    Logger.log(body);

    return {
      status: statusCode,
      bodyPreview: body
    };

  } catch (err) {
    Logger.log("Request failed:");
    Logger.log(err);
    throw err;
  }
}

function testVintedItemPage() {
  const url = "https://www.vinted.co.uk/items/7839806212-barbour-boxy-jacket";

  const headers = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9,id;q=0.8,fa;q=0.7,ar;q=0.6,ms;q=0.5,ja;q=0.4,es;q=0.3",

    // VERY IMPORTANT: paste the full cookie string as-is
    "cookie": "v_udt=alM2d2dIeUxGOTZqZ2NVS29haEEvMGwwWWJreS0tQUpTdnBXWE9xRzQycERtQS0tQklmMjZ3bXJnUGhVendjdWtZem5idz09; anon_id=48293372-ce2f-4340-b60a-6bc17f82fece; anonymous-locale=en-uk-fr; non_dot_com_www_domain_cookie_buster=1; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzY3Nzk2MDU0LCJpYXQiOjE3NjcxOTEyNTQsImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJyZWZyZXNoIiwic2NvcGUiOiJwdWJsaWMiLCJzaWQiOiIwZjNkNGVlNy0xNzY3MTkxMjU0In0.Xqme_x19qmHS7dWFbf60DN7oeS66ygrqpmV2lTEsafw_2zkmlX37rLpVfiXizj06j6jvnDa7_Qw79JbuyguM_e5QxQZdNdIpw-I0Xm2nzv8yaW-wYfVFEoSUYjo9PPg-WBlgcsipbQ9-ioYzNo_NA4Vxuja79yLNxcn8xznACsf_zFB_5VXGW_0yWFmrUpja5wMh1wsHM8Ji9CNQtdomVPwgnj07hU_cJ2KnGLJ-TOVUMpejQ-MRtkLLijvmz88IJugIG_566W2uYn-7IeVjycY_bT60I1ijtZtaWR8Ez7hmkXNrbAEeMOsr3ucsy4zBuioDh_Bg4IHM-v_IpVpb0A; access_token_web=; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzY3MTk4NDU0LCJpYXQiOjE3NjcxOTEyNTQsImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJhY2Nlc3MiLCJzY29wZSI6InB1YmxpYyIsInNpZCI6IjBmM2Q0ZWU3LTE3NjcxOTEyNTQifQ.tfGoPHEo6jS_YIiChsTfWvW3iU3CS7ydTwUkBmU-nQxcYJ9xEEP8yPeBwWvkHyByST-DXGWw-jlSb25NJgEjKqxHyv1atD_MFgOp9iJL8xkXJRka3rNzKC-i5jZj_9F7g1T7blzf0LulqRPPiqAx8-nt8unt8j-4EWR3REJJowmeG0tYFQfmnqFGxMuEQkSNXI7zi_Kw9rrcmdAvROPkSOaijCK8LsyF6eGQO9zDZLIN6Ch252o0c24Ki_X9NtIdBDWLpryULp0p1JDkCWm4rrjC4rAlnrTOOPld4s0mGuSxrWavRUXSlpPH2R_rVD3VMD6H57GBJpsMdjOlmR9U4A; datadome=; __cf_bm=M4lDvB5AkdaKMlDd5tff4ONAd0nz_dFaANKfwbKne5Y-1767191254-1.0.1.1-VXweDNsYWY34IMQYP435y2wDTByc86rwEc4flKkQ0020xgK.t8vNh4jUIXsGm6wtcHnw04h0bwrS3hUZe2L58.CaQqSDmSBFTmGaITHdGgtTF9hggOum3ZCJxxKiEico",

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

  const options = {
    method: "get",
    headers: headers,
    followRedirects: true,
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const status = response.getResponseCode();
  const html = response.getContentText();

  Logger.log("Status Code: " + status);
  // Logger.log("HTML Length: " + html.length);
  // Logger.log("Content: " + html);

  return {
    status: status,
    htmlLength: html.length
  };
}

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

  function buildHeaders(cookie) {
    return {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9,id;q=0.8,fa;q=0.7,ar;q=0.6,ms;q=0.5,ja;q=0.4,es;q=0.3",
      "cookie": cookie,
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

  let cookie = "v_udt=dmdQMGdKeG13K3gwTzZMZXcvUjFrKzJXdVF4Yy0tS2kzZk04enlTaVRCMmpoNC0tWFJzSzhMT3YxaWpuT2psZmlSd1BwQT09; anonymous-locale=en-uk-fr; non_dot_com_www_domain_cookie_buster=1; is_shipping_fees_applied_info_banner_dismissed=false; viewport_size=786; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhY2NvdW50X2lkIjozMTMxNTUwMzE3LCJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzY3NzkyMTE5LCJpYXQiOjE3NjcxODczMTksImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJyZWZyZXNoIiwic2NvcGUiOiJ1c2VyIiwic2lkIjoiNTYxYjYyNTAtMTc2NzE4NzMxOSIsInN1YiI6Ijg1NjcyOTQwIiwiY2MiOiJVSyIsImFuaWQiOiI3N2Q2NDc2MC1jNjcxLTQ4YjYtYjc5Mi1kZDhmMWVjZmNkMDAiLCJhY3QiOnsic3ViIjoiODU2NzI5NDAifX0.KMY7uCoVijNSK0cdtFmDses87AQXGno68jTwfLgEpXbYqvc_Xis7yEeU9yHhXa9zjffkA7W7le7Xe0YrOWsyeU6XeUlpLYK58XMVJ_RmQs2iZXHpiyyi5ctaOa0sEuyjQ3x3dpyewFJ34PGuSzIYE_k4TDH7D_zLc9cWXFvnDEqHgyvcjxDdtdp2IsdpT610M38U9GA89JJDSDS7YTt41IKfBA8BPwZrzPO6PGhyzKNOmRVBEzjSHP17ercx6ge00euA1cJnlFUMkLiTfPtGrjB_2IVRscK2MnO21kYrPXHHZG4TPmoE-8IvyICBfFubE_R8LXm9BAiKiF46hKq4Hg; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhY2NvdW50X2lkIjozMTMxNTUwMzE3LCJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzY3MTk0NTE5LCJpYXQiOjE3NjcxODczMTksImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJhY2Nlc3MiLCJzY29wZSI6InVzZXIiLCJzaWQiOiI1NjFiNjI1MC0xNzY3MTg3MzE5Iiwic3ViIjoiODU2NzI5NDAiLCJjYyI6IlVLIiwiYW5pZCI6Ijc3ZDY0NzYwLWM2NzEtNDhiNi1iNzkyLWRkOGYxZWNmY2QwMCIsImFtciI6WyJtZmEiLCJzbXMiXSwiYWN0Ijp7InN1YiI6Ijg1NjcyOTQwIn19.JnORTOpGC12iioP_mvhNJiU_P1Xf5Y2HoHWHe1W3dRlu2-D4Awo2FL0TdpVRXJxDDYAKKSC-aaSqbZ6ylsym7csPfnvJbaVVTxK1oEAls2RJ_IjU4PPzYBFYT-gLgK-08wKF1usLMBK59yYbpm_wgKeyIOz_NkUNRJxMyGCdd6Zsceb-M1dSkEMMo77CEQQzOlrB7w-Ods9oOEXFEzPZWx99sl-tX7HZP8-xoZRminqzJbfcKGzeYF1qnUbGFHsPiPrs0hyo11fDEIQbYxyUJ8bYUrBH5VWAu9_DMFdKNmffTqN8yUvN0tSsagcslN74UUikxuVvLxeBh4fMFtdyKw; anon_id=77d64760-c671-48b6-b792-dd8f1ecfcd00; v_uid=85672940; v_sid=561b6250-1767187319; domain_selected=true; cf_clearance=Ze3GlTUfwQZuen1lf4qHYXsVeteBA9lVhG0reEPLNhQ-1767188992-1.2.1.1-S1Dv1zJXRF2rtK.1QyQfGEKC4vwJbpY.Yl8k7iab8kDjvyBSm0yM07OabZ_yBwdj_K0lN2xwBCdZP3tB7FphdHzkn0lFJB6TGS4GPwpzGeGZJuMZNWjhuNN1j0ywGhpFdfssym8NIMwiuQ68UlS6xNgN2ZVPD0qOYMZSlIHTTFYybHwjIO5K22kyX2u_kacqkgFrhBdziz_9RLL4hge6p_Uyu0zEbQu311Sy41t5vmI; datadome=lPdyruDM7MIy393N_4~R~83xOVcUtJnKjHz8jSJdDsvKEno_p3QskG9HMVuPH1DkzHgnhTg5gCG_5ih1MQe0DrUIL5yTgT_gK~X9fsVa80Eh4KK0l3faoUHE~zB8Frs4; _vinted_fr_session=L0tNSzhZL2JtV09oYmpERmJZY3FrWVdpOTgrWVhFN1ZHcXdacTAxVHBIanYrUFJydWpvUnlvKzFGYk1OODR0cmQrOGw2azYra1JDZjQyU2xvd2ZzK1hzY1NGZ09pUFZINEpsdkdQcVJyWi9WcW02TXE0N044cm16ZmlvaDJQaEQrbktQM1AzT0pOQXViWDFXL2FmR0szQ3ZWNGIrQ0xheFBjR1huVGM5OXhuVzRMc3hGajU1N2QrRittWjRkSFRIWjRWU2RhaEt5ck1NT2pobmM2aXo5ZkNZMWJ5R1kxa0RiMlgzeHUwZU4vMzFHRUhGa3Y4azZPSkVtbDlhL2xzbGVLZHFBTFRDK3VEVEczVkphcG0yWHFib0p4dG10aHd4ZHdROVBqNWdMS2hseXhkbTY3SHQzL2RkMGdPeUJBMitJRkNMZlV3eXJrelQ5OVlySzFJZGphR2lSSTVLU1lFV2Y4WDVoZDY2V3RpQUZVWE0xSjNiSUk4THRkcDRHMGtPLS1lN2dSY3lHVmRhNEVqM3Izc2ZPQUFBPT0%3D--95f14c64a416b7e0852777ab38d95ddac55ff534";

  function fetchOnce(cookieValue) {
    return UrlFetchApp.fetch(url, {
      method: "get",
      headers: buildHeaders(cookieValue),
      followRedirects: true,
      muteHttpExceptions: true
    });
  }

  // First attempt
  let response = fetchOnce(cookie);
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
  Logger.log("HTML Length: " + html.length);

  return {
    status: status,
    htmlLength: html.length,
    refreshed: status !== 200
  };
}



