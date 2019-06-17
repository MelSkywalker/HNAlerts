require('dotenv').config();
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const Twitter = require('twitter');
const fetch = require('node-fetch');
// const config = require('./config');

const url = 'https://news.ycombinator.com/news';
const url1 = 'https://hn.algolia.com/?query=';
const url2 = '&sort=byPopularity&prefix&page=0&dateRange=all&type=story';
const user = ' @mel_quote';

const twitter = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_COMSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

console.log(process.env);
// const twitter = new Twitter(config);

function getNews(topic) {
    return fetch(`${url}`)
    .then(res => res.text());
}

const applyCheerio = body => {
    const news = [];
    const $ = cheerio.load(body);
    $('.title > a').each(function(i,element ){
        const title = $(element).text();
        const link = $(element).attr('href');
        news.push({ title, link });
    });
    return news;
}

const filteredNotes = res => {
    return res.filter(note => {
        return note.title.includes('Google');
    })
};

const getLink = notes => {
    return notes[0].link;
};

const tweetResult = (res) => {
    return new Promise(function (resolve, reject) {
        twitter.post('statuses/update', {status: user + ' Última noticia de Google: ' + res}, (function(error, tweet, response) {
            if(error !== null) {
                reject(error);
            }
            resolve(tweet);
        }))
    })
};

const showErrors = (error) => {
    console.error(error);
};

getNews()
.then(applyCheerio)
.then(filteredNotes)
.then(getLink)
.then(tweetResult)
.catch(showErrors);