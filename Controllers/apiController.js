/* eslint-disable prettier/prettier */
const { exec } = require('child_process');
// Promisify the child_process.exec() function
const { promisify } = require('util');
const extractUrl = require('url');
const execPromise = promisify(exec);
const axios = require('axios').default;
const cheerio = require('cheerio');
const logger = require('pino')();
// const CryptoJS = require('crypto-js');
const {
  generateUniqueKey,
  decryptAjaxResp,
} = require('../Utils/ajaxExtractor');
const { extractEpisodeData } = require('../Utils/episodeExtractors');

let { base_urls: baseUrl, cdn_uri: cdnUrl } = process.env;
const config = {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    Host: 'ajax.gogocdn.net',
  },
};

const availableBaseUrl = '';
exports.home = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'ok',
  });
};

exports.recentRelease = async (
  req,
  res,
  next,
  page = 1,
  type = 1,
  recentAnime = []
) => {
  try {
    const { page, type } = req?.query || 1;

    const finalUrl = `${cdnUrl}ajax/page-recent-release.html?page=${page}&type=${type}`;
    const resp = await axios.get(finalUrl, {
      ...config,
    });

    const $ = cheerio.load(resp.data);

    $('div.last_episodes ul.items li').each(function () {
      const animeImg = $(this).find('img').attr('src');
      const epLink = $(this).find('a').attr('href');
      // const title = $(this).find('a').attr('title');
      const titleEl = $(this).find('a').eq(1);
      const title = titleEl.attr('title') || titleEl.text().trim();
      const epNumber = $(this).find('.episode').text();

      recentAnime.push({
        animeImg,
        epLink,
        title,
        epNumber,
      });
    });

    res.status(200).json({
      recentAnime,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

exports.popularOngoing = async (
  req,
  res,
  next,
  page = 1,
  popularAnime = []
) => {
  try {
    const resp = await axios.get(
      `${cdnUrl}ajax/page-recent-release-ongoing.html?page=${page}`,
      {
        ...config,
      }
    );
    const $ = cheerio.load(resp.data);

    $('div.added_series_body.popular li').each((i, el) => {
      const animeSrc = $(el)
        .find('a:first-child')
        .attr('href')
        .replace('/category/', '');
      const titleEl = $(el).find('a').eq(1);
      const title = titleEl.attr('title') || titleEl.text().trim();
      const animeImg = $(el)
        .find('div.thumbnail-popular')
        .attr('style')
        .match(/url\((.*?)\)/)[1]
        .replace(/^'|'$/g, '');
      const episodeNo = $(el).find('p:last-child a').text();

      popularAnime.push({
        animeSrc,
        title,
        animeImg,
        episodeNo,
      });
    });

    res.status(200).json({
      popularAnime,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

exports.getCurrentVideoSource = async (req, res, next) => {
  try {
    let tempUrl;
    tempUrl = JSON.parse(baseUrl);
    let host = '';
    const pingPromise = async (url) => {
      try {
        await axios.get(`https://${url}`);
        logger.info(`${url} is available.`);
        host = url;
        return `https://${url}/`;
      } catch (err) {
        console.error(`${url} is not available: ${err.message}`);
        return null;
      }
    };

    let baseUrlToUse = null;

    for (const url of tempUrl) {
      const result = await pingPromise(url);
      if (result !== null) {
        baseUrlToUse = result;
        break;
      }
    }

    if (!baseUrlToUse) {
      throw new Error(`None of the URLs were available: ${tempUrl}`);
    }

    // Make the axios.get() call with the chosen base URL
    const resp = await axios.get(baseUrlToUse + req.params.epId, {
      headers: {
        ...config.headers,
        host,
      },
    });

    // Load with Cheerio
    const $ = cheerio.load(resp.data);
    // TODO: Need to get Episode List's

    // const currentLists = extractEpisodeData(resp.data);

    const srcLink = $(
      'div.anime_video_body_watch_items div.play-video iframe'
    ).attr('src');
    const animeInfoUrl = $('.anime-info a').attr('href');
    const categoryString = /\/category\/(.+)/.exec(animeInfoUrl)[1];

    // Get the episode start and episode end values
    const episodeLink = $('ul#episode_page li a.active');
    const episodeStart = episodeLink.attr('ep_start');
    const episodeEnd = episodeLink.attr('ep_end');
    // logger.info(`Generated Link: ${srcLink}`);

    // Get Video Player with sources for current Video URL:

    host = new URL(srcLink).hostname;
    const videoPlayer = await axios.get(
      `${srcLink?.includes('https:') ? srcLink : 'https:' + srcLink}`,
      {
        headers: {
          ...config.headers,
          host,
        },
      }
    );

    const domainExtract = (url) => {
      const domain = url.match(/^(?:https?:)?(?:\/\/)?([^/]+)/);
      return domain ? domain[1] : '';
    };

    let newUrl = domainExtract(srcLink);

    // const $$ = cheerio.load(videoPlayer.data);
    const encryptedReq = generateUniqueKey(videoPlayer);

    if (encryptedReq.error) {
      throw new Error(
        `An Error occured while Generating encrypted URL: ${encryptedReq.error}`
      );
    }
    // logger.info(`Generated Link: ${encryptedReq.url}`);

    // TODO: Send Encrypted Request and GET SRC
    if (!newUrl.includes('https://')) {
      newUrl = `https://${newUrl}`;
    }
    const getSourceRequest = await axios.get(`${newUrl + encryptedReq.url}`, {
      headers: {
        ...config.headers,
        Referer: srcLink,
        'X-Requested-With': 'XMLHttpRequest',
        host,
      },
    });
    // TODO: Need to Decrypt the Data:

    // Decrypt URL and get Video Source:
    const decryptedSourceData = decryptAjaxResp(
      getSourceRequest.data.data,
      encryptedReq.videocontentKey,
      encryptedReq.wrapperKey
    );

    decryptedSourceData.animeInfo = categoryString;

    res.send(decryptedSourceData);
  } catch (err) {
    console.error(`An error occurred in getCurrentVideoSource: ${err.message}`);
    res.status(400).json({
      message: err.message,
    });
  }
};

exports.getAnimeDetails = async (req, res, next, episodes = []) => {
  try {
    const { animeId } = req?.params;
    const { extractEpisode } = req.query;
    if (!animeId || animeId === 'undefined') {
      throw new Error('animeId is required');
    }

    let tempUrl;
    tempUrl = JSON.parse(baseUrl);
    let host = '';
    const pingPromise = async (url) => {
      try {
        await axios.get(`https://${url}`);
        logger.info(`${url} is available.`);
        host = url;
        return `https://${url}/`;
      } catch (err) {
        console.error(`${url} is not available: ${err.message}`);
        return null;
      }
    };

    let baseUrlToUse = null;

    for (const url of tempUrl) {
      const result = await pingPromise(url);
      if (result !== null) {
        baseUrlToUse = result;
        break;
      }
    }

    if (!baseUrlToUse) {
      throw new Error(`None of the URLs were available: ${tempUrl}`);
    }

    const formatUrl = `${baseUrlToUse}category/${animeId}`;

    const resp = await axios.get(formatUrl, {
      headers: {
        ...config.headers,
        host,
      },
    });

    const $ = cheerio.load(resp?.data);
    const animeInfo = {
      imageSrc: $('.anime_info_body_bg img').attr('src'),
      animeTitle: $('h1').text(),
      plotSummary: $('.description').text().trim(),
      releasedDate: $('div.anime_info_body_bg > p:nth-child(8)')
        .text()
        .replace('Released: ', ''),
      otherName: $('div.anime_info_body_bg > p:nth-child(10)')
        .text()
        .replace('Other name: ', '')
        .replace(/;/g, ','),
    };

    if (true) {
      const AllEpisodes = await this.extractAllEpisodes(resp?.data, animeId);
      animeInfo.episodeList = AllEpisodes;
    }

    res.status(200).json({
      status: 'success',
      animeInfo,
    });
  } catch (err) {
    console.error(`An error occurred in getAnimeDetails: ${err.message}`);
    res.status(400).json({
      message: err.message,
    });
  }
};

exports.extractAllEpisodes = async (htmlData, animeId, episodes = []) => {
  // if (true) {

  // TODO: fetch Episodes:
  const $ = cheerio.load(htmlData);

  // Extract values from epsodes:
  const liElements = $('#episode_page li');

  let lowestValue = Infinity;
  let highestValue = -Infinity;

  liElements.each((index, element) => {
    const epStart = parseInt($(element).find('a').attr('ep_start'));
    const epEnd = parseInt($(element).find('a').attr('ep_end'));

    lowestValue = Math.min(lowestValue, epStart);
    highestValue = Math.max(highestValue, epEnd);
  });

  // Extract movie_id value
  const movieId = $('input#movie_id').val();

  const loadListEpisodes = `${cdnUrl}ajax/load-list-episode?ep_start=${lowestValue}&ep_end=${highestValue}&id=${movieId}&alias=${animeId}`;

  const resp = await axios.get(loadListEpisodes, {
    ...config,
  });

  const $$ = cheerio.load(resp?.data);

  $$('#episode_related li a').each((index, element) => {
    const label = parseFloat(
      $(element).find('.name').text().trim().replace('EP', '').trim()
    );
    const value = $(element).attr('href').trim();

    episodes.push({ label, value });
  });

  return episodes;
};
