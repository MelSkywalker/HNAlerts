require('dotenv').config();
const cheerio = require('cheerio');
const Twitter = require('twitter');
const fetch = require('node-fetch');
const configGoogle = require('./configGoogle')
const configFb = require('./configFb');
const cron = require('node-cron');
const flatten = require('lodash.flatten');
const differenceBy = require('lodash.differenceby');

const url = 'https://news.ycombinator.com/news';
const topics = ['Google', 'Facebook'];
const prevNews = [];

// const twitter = new Twitter(configGoogle);
const twitterGoogle = new Twitter(configGoogle);
const twitterFacebook = new Twitter(configFb);

const twitters = {
    Google: twitterGoogle,
    Facebook: twitterFacebook
}

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

const filterNotes = (news, topics) => flatten(topics.map(topic => {
    return news.filter(note => note.title.includes(topic)).map(note => ({...note, topic}));
}));

const checkNews = (notes) => {
    const newNotes = differenceBy(notes, prevNews, 'title');
    prevNews.push(...newNotes);
    return newNotes;
}

const tweetNotes = (notes) => {
    return notes.map(note => new Promise(function(resolve, reject) {
        twitters[note.topic].post('statuses/update', {status: `#hn${note.topic}Alerts Esta es la última noticia de #${note.topic}: ${note.link}`}, (function(error, tweet, response) {
            if(error !== null) {
                reject(error);
            }
            resolve(tweet, console.log(`Tweeted on ${note.topic} news!`));
        }))
    }))
}

const showErrors = (error) => {
    console.error(error);
};

const handleGoogleNotes = (res) => filterNotes(res, topics);

const tweetNews = () => {
    getNews()
        .then(applyCheerio)
        .then(handleGoogleNotes)
        .then(checkNews)
        .then(tweetNotes)
        .then((res) => (Promise.all(res)))
        .catch(showErrors);
}

const cronNews = () => {
    cron.schedule('*/30 * * * *', function() {
        tweetNews();
        console.log('Run cronNews');
    })
}

cronNews();