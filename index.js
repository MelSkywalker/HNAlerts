require('dotenv').config();
// const fs = require('fs');
// const request = require('request');
const cheerio = require('cheerio');
const Twitter = require('twitter');
const fetch = require('node-fetch');
const config = require('./config')
const CronJob = require('cron').CronJob;

const url = 'https://news.ycombinator.com/news';
// const url1 = 'https://hn.algolia.com/?query=';
// const url2 = '&sort=byPopularity&prefix&page=0&dateRange=all&type=story';
// const user = ' @mel_quote';
// const user_id = '335746109';
// const topic = 'Facebook';
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
    return new Promise(function (resolve, reject) {
        twitter.post('statuses/update', {status: `@${user} Última noticia de #${topic}: ${res} `}, (function(error, tweet, response) {
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

const timer = new CronJob('*/10 * * * * *', function() {
    console.log('Every 10 seconds');
});

getNews()
.then(applyCheerio)
.then(filteredNotes)
.then(getLink)
.then(tweetResult)
.then(timer.start())
.catch(showErrors);