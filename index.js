require('dotenv').config();
const cheerio = require('cheerio');
const Twitter = require('twitter');
const fetch = require('node-fetch');
const config = require('./config')
const cron = require('node-cron');

const url = 'https://news.ycombinator.com/news';
const topic = process.argv[2];
const user = process.argv[3];

const userExists = (u) => {
    if (u) return `@${u} `;
    else return '';
}

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
        twitter.post('statuses/update', {status: `¡Hola${(userExists(user))}! Esta es la última noticia de #${topic}: ${res} `}, (function(error, tweet, response) {
            if(error !== null) {
                reject(error);
            }
            resolve(tweet, console.log('Tweeted!'));
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
    cron.schedule('0 */3 * * *', function() {
        tweetNews();
    })
}

cronNews();