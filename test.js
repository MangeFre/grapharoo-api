const express = require('express');
const fetch = require('node-fetch');
const btoa = require('btoa');
require('dotenv').config();

const app = express();
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

async function testAuth(){
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

const authData = testAuth();
authData.then((data) => {
    console.log(data)
}, (err) => {
    console.log('Error' + err);
})