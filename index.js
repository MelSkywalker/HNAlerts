require('dotenv').config();
// const fs = require('fs');
// const request = require('request');
const cheerio = require('cheerio');
const Twitter = require('twitter');
const fetch = require('node-fetch');
const config = require('./config')
const cron = require('node-cron');

const url = 'https://news.ycombinator.com/news';
// const url1 = 'https://hn.algolia.com/?query=';
// const url2 = '&sort=byPopularity&prefix&page=0&dateRange=all&type=story';
const topic = process.argv[2];
const user = process.argv[3];

const twitter = new Twitter(config);

function getNews() {
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

const filteredNotes = (res) => {
    return res.filter(note => {
        return note.title.includes(topic);
    })
};

const getLink = notes => {
    return notes[0].link;
};


const tweetResult = (res) => {
    console.log('tweetResult');
    return new Promise(function (resolve, reject) {
        twitter.post('statuses/update', {status: `¡Hola @${user} ! Esta es la última noticia de #${topic}: ${res} `}, (function(error, tweet, response) {
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

const tweetNews = () => {
    getNews()
        .then(applyCheerio)
        .then(filteredNotes)
        .then(getLink)
        .then(tweetResult)
        .catch(showErrors);
}

const cronNews = () => {
    tweetNews();
    cron.schedule('0 0 */1 * * *', function() {
        tweetNews();
    })
}

cronNews();