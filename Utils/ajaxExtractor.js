const CryptoJS = require('crypto-js');
const cheerio = require('cheerio');

exports.generateUniqueKey = (videoPlayer) => {
  try {
    const $$ = cheerio.load(videoPlayer.data);
    const script = $$("script[data-name='episode']").attr('data-value');
    const CONTAINER_REGEX = /container-(\d+)/g;
    const VIDEOCONTENT_REGEX = /videocontent-(\d+)/g;
    const WRAPPER_REGEX = /wrapper container-(\d+)/g;

    const containerKey = CONTAINER_REGEX.exec(videoPlayer.data)?.[1] ?? null;
    const videocontentKey =
      VIDEOCONTENT_REGEX.exec(videoPlayer.data)?.[1] ?? null;
    const wrapperKey = WRAPPER_REGEX.exec(videoPlayer.data)?.[1] ?? null;

    // Decrypt Script Data with KEY
    const decryptedValue = CryptoJS.AES.decrypt(
      script,
      CryptoJS.enc.Utf8.parse(containerKey),
      {
        iv: CryptoJS.enc.Utf8.parse(wrapperKey),
      }
    );
    const groupId = CryptoJS.enc.Utf8.stringify(decryptedValue);
    const refParam = groupId.substring(groupId.indexOf('&') + 1);
    var val = groupId.slice(0, groupId.indexOf('&'));
    //Encrypting ID:
    const _id = CryptoJS.AES.encrypt(
      val,
      CryptoJS.enc.Utf8.parse(containerKey),
      {
        iv: CryptoJS.enc.Utf8.parse(wrapperKey),
      }
    ).toString();

    // Format: GET /encrypt-ajax.php?id=QqtZyrD+XhWVINyuSSK+CA==&title=Ousama+Ranking%3A+Yuuki+no+Takarabako+Episode+8&typesub=SUB&mip=0.0.0.0&refer=https://gotaku1.com/videos/ousama-ranking-yuuki-no-takarabako-episode-8&ch=d41d8cd98f00b204e9800998ecf8427e&token2=bxhgn4jcMhS5pss53TK10g&expires2=1685669660&op=1&alias=MjA1MzY3

    return {
      url: `/encrypt-ajax.php?id=${_id}&alias=${val}&${refParam}`,
      containerKey,
      videocontentKey,
      wrapperKey,
    };
  } catch (err) {
    // Handle the error
    console.error('An error occurred inside generateUniqueKey():', error);
    // Return an error response or fallback value
    return {
      error: 'An error occurred while generating the unique key',
    };
  }
};

exports.decryptAjaxResp = (encryptedData, videocontentKey, wrapperKey) => {
  //
  const map = JSON.parse(
    CryptoJS.enc.Utf8.stringify(
      CryptoJS.AES.decrypt(
        encryptedData,
        CryptoJS.enc.Utf8.parse(videocontentKey),
        {
          iv: CryptoJS.enc.Utf8.parse(wrapperKey),
        }
      )
    )
  );

  return map;
};
