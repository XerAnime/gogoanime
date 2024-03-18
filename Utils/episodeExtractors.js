/* eslint-disable prettier/prettier */

const cheerio = require('cheerio');

exports.extractEpisodeData = (htmlData) => {
  const $ = cheerio.load(htmlData);

  // Get the active episode start and episode end values
  const activeEpisodeLink = $('ul#episode_page li a.active');
  const activeEpisodeStart = activeEpisodeLink.attr('ep_start');
  const activeEpisodeEnd = activeEpisodeLink.attr('ep_end');

  // Get the non-active episode start and episode end values
  const nonActiveEpisodes = [];
  $('ul#episode_page li a').each((index, element) => {
    const link = $(element);
    // if (!link.hasClass('active')) {
    const episodeStart = link.attr('ep_start');
    const episodeEnd = link.attr('ep_end');
    nonActiveEpisodes.push({ episodeStart, episodeEnd });
    // }
  });

  return {
    activeEpisodeStart,
    activeEpisodeEnd,
    nonActiveEpisodes,
  };
};
