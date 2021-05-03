#!/usr/bin/env node

const fs = require('fs');
const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const jsdom = require("jsdom");

axiosCookieJarSupport(axios);
axios.defaults.withCredentials = true;
const { JSDOM } = jsdom;

const userAgent = "Mozilla/5.0 Chrome/89.0.4389.90 Mobile Safari/537.36";

const encodeForm = (data) => {
    return Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');
}

async function login() {
    const cookieJar = new tough.CookieJar();
    const password = fs.readFileSync(__dirname + "/.secret").toString().trim();
    const netid = fs.readFileSync(__dirname + "/.username").toString().trim();
    let ret = await axios.get(`https://dailycheck.cornell.edu/saml_login_user?redirect=%2F`, {
        headers: { 'User-Agent': userAgent },
        jar: cookieJar,
        withCredentials: true
    });

    let dom = new JSDOM(ret.data);
    const samlReq = dom.window.document.querySelector("input[name='SAMLRequest']").value;
    let relayState = 'https://dailycheck.cornell.edu/saml_login_user?redirect=%2F';

    await axios.post('https://shibidp.cit.cornell.edu/idp/profile/SAML2/POST/SSO', encodeForm({
            'SAMLRequest': samlReq,
            'RelayState': relayState,
        }), {
            maxRedirects: 0,
            headers: {
                'User-Agent': userAgent,
                'Referer': `https://dailycheck.cornell.edu/`,
                'Origin': 'https://dailycheck.cornell.edu',
            },
            jar: cookieJar,
            withCredentials: true
        }).catch(async (e) => {
            ret = await axios.get(`https://shibidp.cit.cornell.edu${e.response.headers.location}`, {
                headers: { 'User-Agent': userAgent },
                jar: cookieJar,
                withCredentials: true
            });
        });

    dom = new JSDOM(ret.data);
    const loginAction = dom.window.document.querySelector("form[name='login']").action;

    ret = await axios.post(`https://web2.login.cornell.edu/${loginAction}`, encodeForm({
            'netid': netid,
            'password': password,
        }), {
            maxRedirects: 0,
            headers: {
                'User-Agent': userAgent,
            },
            jar: cookieJar,
            withCredentials: true
        });
    dom = new JSDOM(ret.data);
    let cont = dom.window.document.querySelector("form[name='bigpost']").action;
    const wa = dom.window.document.querySelector("input[name='wa']").value;
    ret = await axios.post(cont, encodeForm({
            'wa': wa,
        }), {
            headers: {
                'User-Agent': userAgent,
            },
            jar: cookieJar,
            withCredentials: true
        });

    // Continue button
    dom = new JSDOM(ret.data);
    cont = dom.window.document.querySelector("form").action;
    relayState = dom.window.document.querySelector("input[name='RelayState']").value;
    samlResp = dom.window.document.querySelector("input[name='SAMLResponse']").value;
    //console.log(cont, relayState, samlResp);

    await axios.post(cont, encodeForm({
            'RelayState': relayState,
            'SAMLResponse': samlResp,
        }), {
            maxRedirects: 0,
            headers: {
                'User-Agent': userAgent,
            },
            jar: cookieJar,
            withCredentials: true
        }).catch(async (e) => {
            ret = await axios.get(e.response.headers.location, {
                headers: { 'User-Agent': userAgent },
                jar: cookieJar,
                withCredentials: true
            });
        });
    return cookieJar;
}

async function dailyCheckStatus(cookieJar) {
    ret = await axios.get('https://dailycheck.cornell.edu/daily-checkin', {
        headers: {
            'User-Agent': userAgent,
        },
        jar: cookieJar,
        withCredentials: true
    });

    dom = new JSDOM(ret.data);
    const isGreen = dom.window.document.querySelector(".status_green");
    if (!isGreen) {
    }
    return isGreen ? isGreen.textContent : "Not checked-in. Use `--checkin` to check in.";
}

async function dailyCheck(cookieJar) {
    let dom = new JSDOM((await axios.get('https://dailycheck.cornell.edu/daily-checkin', {
        headers: {
            'User-Agent': userAgent,
        },
        jar: cookieJar,
        withCredentials: true
    }).catch(_ => {})).data);
    let _token = dom.window.document.querySelector("input[name='_token']");
    if (!_token) {
        console.log("Already checked-in.");
        return;
    } else {
        console.log(`${_token} done.`);
    }
    _token = _token.value;
    console.log(_token);
    let ret = await axios.post('https://dailycheck.cornell.edu/dailypost', encodeForm({
        'covidsymptoms': 'no',
        'telemedvisit': '',
        'cleared': '',
        'contactsymptoms': 'no',
        'contacttraced': '',
        'contacttelemedvisit': '',
        'clearedcontact': '',
        'clearedcontacttrace': '',
        'exposure': 'no',
        'positivetestever': 'no',
        'positivetest': '',
        '_token': _token,
    }), {
        headers: {
            'User-Agent': userAgent,
        },
        jar: cookieJar,
        withCredentials: true
    });
}

async function main() {
    const yargs = require('yargs/yargs')
    const { hideBin } = require('yargs/helpers')
    const argv = yargs(hideBin(process.argv)).argv
    if (argv.checkin) {
        dailyCheck(await login());
    } else if (argv.status) {
        console.log(await dailyCheckStatus(await login()));
    }

}

if (require.main === module) {
    main();
}

module.exports = {
    dailyCheck
}
