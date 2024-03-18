# GogoanimeApi - An api scraping anime Details from gogoanime

Inspired from [rimuru/gogoanime-api](https://github.com/riimuru/gogoanime-api).

Welcome to the Gogoanime API! 🌟. This API is built on Express.js and JavaScript, and it specializes in fetching anime URLs through web scraping. Below, you'll find all the information you need to get started.

## Introduction
The gogoanime API is designed to make it easy for developers to access anime URLs by leveraging web scraping techniques. We understand your passion for anime, and our goal is to simplify the process of obtaining relevant information from various sources.

## Getting Started

```sh
git clone 
cd gogoanime
npm install
npm run start:dev
```
> Note: You can access it's full stack using the UI [radioac7iv3/nitroui-revised](https://github.com/radioac7iv3/nitroui-revised)


## API Reference

#### Get Recently Released Anime

```http
  GET /api/v1/recent-release?page={pageNo}&type={animeType}
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `page=1` | `string` | Specify the Page Number |

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `type=1` | `string` | Recently Relased JP Anime |

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `type=2` | `string` | Recently Dubbed Anime |

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `type=2` | `string` | Recently Released CH Anime |

#### Popular Ongoing Anime

```http
  GET /api/v1/popular-ongoing
```

#### GET Anime Video URL

```http
  GET /api/v1//watch/:epId
```
Where epId is the EpisodeId (For Eg. majo-to-yajuu-episode-3)


## Still Having Doubts
You can run a Full-Stack version using this server as a backend and [radioac7iv3/nitroui-revised](https://github.com/radioac7iv3/nitroui-revised) as a Frontend.


## Development
As this API is still in progress so do you want to contribute? Great

Feel Free to Fork and make a PR, I will merge the Code if the code looks safe. Happy Coding!

## Sponsor this project

Contributions are always welcome!

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/radioac7iv3)
