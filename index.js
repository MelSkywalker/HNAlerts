const request = require('request');
const cheerio = require('cheerio');
const twitter = require('twitter');

request('https://news.ycombinator.com/', (err, res, html) => {
    const $ = cheerio.load(html);
    const itemlist = $('.itemlist');
    const newsList = $('.athing').text();
    console.log(newsList);
});