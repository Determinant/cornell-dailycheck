#!/usr/bin/env -S npx ts-node

import * as fs from 'fs';
import axios, { AxiosResponse } from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import * as tough from 'tough-cookie';
import { JSDOM } from 'jsdom';

const userAgent = "Mozilla/5.0 Chrome/89.0.4389.90 Mobile Safari/537.36";

axiosCookieJarSupport(axios);
axios.defaults.withCredentials = true;
axios.defaults.headers['User-Agent'] = userAgent;

const encodeForm = (data: {[key: string]: string}) => {
    return Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');
}

function findElemByName<E extends Element>(dom: JSDOM, elem: string, name: string) {
    const e = dom.window.document.querySelector<E>(`${elem}[name='${name}']`);
    if (e === null)
        throw `unable to find ${elem}: ${name}`;
    return e;
}

function findFormByName(dom: JSDOM, name: string) {
    return findElemByName<HTMLFormElement>(dom, "form", name);
}

function findInputByName(dom: JSDOM, name: string) {
    return findElemByName<HTMLInputElement>(dom, "input", name);
}

async function login() {
    const cookieJar = new tough.CookieJar();
    const password = fs.readFileSync(__dirname + "/.secret").toString().trim();
    const netid = fs.readFileSync(__dirname + "/.username").toString().trim();
    let ret = await axios.get(`https://dailycheck.cornell.edu/saml_login_user?redirect=%2F`, {
        jar: cookieJar
    });

    let dom = new JSDOM(ret.data);
    const _samlReq = dom.window.document.querySelector<HTMLInputElement>("input[name='SAMLRequest']");
    if (_samlReq === null)
        throw "unable to get SAMLRequest";
    const samlReq = _samlReq.value;
    let relayState = 'https://dailycheck.cornell.edu/saml_login_user?redirect=%2F';

    await axios.post('https://shibidp.cit.cornell.edu/idp/profile/SAML2/POST/SSO', encodeForm({
        'SAMLRequest': samlReq,
        'RelayState': relayState,
    }), {
        maxRedirects: 0,
        jar: cookieJar
    }).catch(async (e) => {
        ret = await axios.get(`https://shibidp.cit.cornell.edu${e.response.headers.location}`, {
            jar: cookieJar
        });
    });

    const loginAction = findFormByName(new JSDOM(ret.data), "login").action;
    ret = await axios.post(`https://web2.login.cornell.edu/${loginAction}`, encodeForm({
        'netid': netid,
        'password': password,
    }), {
        maxRedirects: 0,
        jar: cookieJar
    });
    dom = new JSDOM(ret.data);
    let cont = findFormByName(dom, 'bigpost').action;
    const wa = findInputByName(dom, 'wa').value;
    ret = await axios.post(cont, encodeForm({
        'wa': wa,
    }), { jar: cookieJar });

    // Continue button
    dom = new JSDOM(ret.data);
    const _cont = dom.window.document.querySelector("form");
    if (_cont == null)
        throw 'unable to find form';
    cont = _cont.action;
    relayState = findInputByName(dom, 'RelayState').value;
    const samlResp = findInputByName(dom, 'SAMLResponse').value;

    await axios.post(cont, encodeForm({
        'RelayState': relayState,
        'SAMLResponse': samlResp,
    }), {
        maxRedirects: 0,
        jar: cookieJar
    }).catch(async (e) => {
        ret = await axios.get(e.response.headers.location, { jar: cookieJar });
    });
    return cookieJar;
}

async function dailyCheckStatus(cookieJar: tough.CookieJar) {
    const ret = await axios.get('https://dailycheck.cornell.edu/daily-checkin', {
        jar: cookieJar
    });
    const dom = new JSDOM(ret.data);
    const isGreen = dom.window.document.querySelector(".status_green");
    return isGreen ? isGreen.textContent : "Not checked-in. Use `--checkin` to check in.";
}

async function dailyCheck(cookieJar: tough.CookieJar) {
    const ret = await axios.get('https://dailycheck.cornell.edu/daily-checkin', {
        jar: cookieJar
    }).catch(_ => null);
    if (ret === null) {
        throw "error while fetching";
    }
    let dom = new JSDOM(ret.data);
    try {
        let _token = findInputByName(dom, '_token');
        console.log(`${_token} done.`);
        const token = _token.value;
        console.log(token);
        await axios.post('https://dailycheck.cornell.edu/dailypost', encodeForm({
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
            '_token': token,
        }), {
            jar: cookieJar
        });
    } catch (_) {
        console.log("Already checked-in.");
    }
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
