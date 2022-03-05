const axios         = require("axios").default;
const crypto        = require('crypto');
const rapidapi_key  = ''

let delay_waiting = 30;

const ApiRequest = async (method) => {
    let options = {
        method: 'GET',
        url: `https://privatix-temp-mail-v1.p.rapidapi.com/request/${method}`,
        headers: {
            'x-rapidapi-host': 'privatix-temp-mail-v1.p.rapidapi.com',
            'x-rapidapi-key': rapidapi_key
        }
    };
    let data = false;
    await axios.request(options).then(function (response) {
        data = response.data
    }).catch(function (error) {
        data = false;
    });
    return data;
}

const getTemplateEmail = async (len = 8) => {
    const alfabet = '1234567890abcdefghijklmnopqrstuvwxyz';
    let name = '';
    for (let i = 0; i < len; i++) {
        const randomChar = Math.round(Math.random() * (alfabet.length - 1));
        name += alfabet.charAt(randomChar);
    }
    const domains   = await getAvailableDomains();
    const domain    = domains[Math.floor(Math.random() * domains.length)];
    return name + domain;
}

const getEmailURL = async (email) => {
    let data = await getEmailContent(email);
    if(!data) {
        return false;
    }

    if (data['error']) {
        delay_waiting = delay_waiting - 1;
        if (delay_waiting > 0) {
            await delay(2000);
            return await getEmailURL(email);
        }
    }

    if (data['error']) {
        return false;
    }

    return await getUrlFromHTML(data[0]['mail_text'])
}

const getEmailHash = (email) => {
    return crypto.createHash('md5').update(email).digest('hex');
}

const getUrlFromHTML = async (html) => {
    let url     = false;
    let patt    = /<a[^>]*href=["']([^"']*)["']/g;
    while (match = patt.exec(html)) {
        url = match[1];
    }
    return url;
}

const getAvailableDomains = async () => {
    return await ApiRequest('domains/');
}

const getEmailContent = async (email) => {
    const email_hash = getEmailHash(email);
    return await ApiRequest(`mail/id/${email_hash}/`);
}

async function delay(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { getTemplateEmail, getEmailURL };
