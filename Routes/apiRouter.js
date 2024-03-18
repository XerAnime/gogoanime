/* eslint-disable prettier/prettier */
const express = require('express');
const apiController = require('../Controllers/apiController');

const router = express.Router();

// Init
router.get('/', apiController.home);

// Anime background for website:
// router.get('/anime-background', apiController.getAnimeWallpaper);

// Recent-Release:
router.get('/recent-release', apiController.recentRelease);
// Popular-ongoing
router.get('/popular-ongoing', apiController.popularOngoing);

// EpLinks
router.get('/watch/:epId', apiController.getCurrentVideoSource);

router.get('/details/:animeId', apiController.getAnimeDetails);

module.exports = router;
