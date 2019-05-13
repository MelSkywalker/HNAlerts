const request = require('request');
const cheerio = require('cheerio');
const Twitter = require('twitter');
const fetch = require('node-fetch');
const config = require('./config');

const url = 'https://news.ycombinator.com/news';
const url1 = 'https://hn.algolia.com/?query=';
const url2 = '&sort=byPopularity&prefix&page=0&dateRange=all&type=story';

const twitter = new Twitter(config);

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
    return notes.forEach(note => {
       return note.link;
    });
};

const tweetResult = (res) => {
    return twitter.post('statuses/update', {status: res + ' @mel_quote'}, (error, tweet, response) => {
        // if (error) throw error;
        console.log(error);
        console.log(tweet);
        // console.log(response);
    });
};

getNews()
.then(applyCheerio)
.then(filteredNotes)
.then(getLink)
.then(tweetResult)
// .catch(showErrors);

// twitter.post('statuses/update', res, function(error, tweet, response){
//     return new Promise((resolve, reject) => {
//         if(error){
//             reject(error);
//         }
//         resolve(result);
//     })
// })

// const tweeted = (error, data, response) => {
//     if (error) throw error;
//     else console.log(data);
// }

// tweet
// twitter.post((error, result))
// return new Promise((resolve, reject) => {
//     if (error) {
//         reject(error);
//     }
//     resolve(result);
// })
