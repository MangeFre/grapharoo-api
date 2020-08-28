const express = require('express');
const fetch = require('node-fetch');
const btoa = require('btoa');
require('dotenv').config();

const app = express();
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

// Get AccessToken needed for oAuth 2.0. Could be needed for NSFW subs etc.
async function getAuth(){
    const headers = {
        'Authorization': 'Basic ' + btoa(`${client_id}:${client_secret}`),
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers,
        body: 'grant_type=client_credentials'
    })
    
    const data = await response.json();
    return data;
}

function trimLink(link){
    // Think this regex will split on / and ?
    const URLarray = link.split(/[/?]/);

    // The 'interesting' part is 7 characters long, always, however we don't know where it is....
    const linkEndOfInterestArray = URLarray.filter((possibleFullname) => {
        return (possibleFullname.length === 7) 
    });

    // MOST LIKELY this is enough for now but... Yeah. Not sure how to check for it.
    const linkEndOfInterest = linkEndOfInterestArray[linkEndOfInterestArray.length - 1];

    // A little wonky, but will return the correct substring
    const trimmedLink = link.substring(0, (link.indexOf(linkEndOfInterest) + 7));
    return trimmedLink;
}

async function getPostAsJson(link){
    const trimmedLink = trimLink(link);
    const jsonLink = trimmedLink + '.json';
    const response = await fetch(jsonLink, {
        'Content-Type': 'application/json'
    });

    const data = response.json();
    return data;
}

// A post contains a lot of stuff. This aims to find the comment of interest
// Returns it as a json object.
function findCommentInPostJson(dataAsJson){
    const postComments = dataAsJson[1];
    const commentBody = postComments.data.children[0].data.body
    return commentBody;
}

async function main(){
    const testLink = 'https://www.reddit.com/r/toiletpaperusa/comments/ifap8u/_/g2nunjn?context=2'
    
    // This is the whole page as data. It's not really what we want.
    const data = await getPostAsJson(testLink);

    // Gets the comment "body" - the actual text value of the comment.
    const comment = findCommentInPostJson(data);

    const indexOfHttp = comment.indexOf('(http');

    // Don't want the ( so we add one.
    const link = indexOfHttp > -1 ? comment.substring(indexOfHttp + 1) : 'No Link Found'

    // This link will have a ) at the end. We find it and remove it.
    const trimmedLink = link.substring(0, link.indexOf(')'));
    
    console.log(trimmedLink);
}

main();