#!/usr/bin/env -S npx ts-node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyCheck = exports.dailyCheckStatus = exports.login = void 0;
var fs = __importStar(require("fs"));
var axios_1 = __importDefault(require("axios"));
var axios_cookiejar_support_1 = __importDefault(require("axios-cookiejar-support"));
var tough = __importStar(require("tough-cookie"));
var jsdom_1 = require("jsdom");
var tough_cookie_file_store_1 = require("tough-cookie-file-store");
var userAgent = "Mozilla/5.0 Chrome/89.0.4389.90 Mobile Safari/537.36";
axios_cookiejar_support_1.default(axios_1.default);
axios_1.default.defaults.withCredentials = true;
axios_1.default.defaults.headers['User-Agent'] = userAgent;
var encodeForm = function (data) {
    return Object.keys(data)
        .map(function (key) { return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]); })
        .join('&');
};
function findElemByName(dom, elem, name) {
    var e = dom.window.document.querySelector(elem + "[name='" + name + "']");
    if (e === null)
        throw "unable to find " + elem + ": " + name;
    return e;
}
function findFormByName(dom, name) {
    return findElemByName(dom, "form", name);
}
function findInputByName(dom, name) {
    return findElemByName(dom, "input", name);
}
function login(cookieJar, netid, password) {
    return __awaiter(this, void 0, void 0, function () {
        var ret, dom, _samlReq, samlReq, relayState, loginAction, cont, wa, _cont, samlResp;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.get("https://dailycheck.cornell.edu/saml_login_user?redirect=%2F", {
                        jar: cookieJar
                    })];
                case 1:
                    ret = _a.sent();
                    dom = new jsdom_1.JSDOM(ret.data);
                    _samlReq = dom.window.document.querySelector("input[name='SAMLRequest']");
                    if (_samlReq === null) {
                        console.log("(Already logged in.)");
                        return [2 /*return*/, cookieJar];
                    }
                    console.log("(Logging in...)");
                    samlReq = _samlReq.value;
                    relayState = 'https://dailycheck.cornell.edu/saml_login_user?redirect=%2F';
                    return [4 /*yield*/, axios_1.default.post('https://shibidp.cit.cornell.edu/idp/profile/SAML2/POST/SSO', encodeForm({
                            'SAMLRequest': samlReq,
                            'RelayState': relayState,
                        }), {
                            maxRedirects: 0,
                            jar: cookieJar
                        }).catch(function (e) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, axios_1.default.get("https://shibidp.cit.cornell.edu" + e.response.headers.location, {
                                            jar: cookieJar
                                        })];
                                    case 1:
                                        ret = _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    loginAction = findFormByName(new jsdom_1.JSDOM(ret.data), "login").action;
                    return [4 /*yield*/, axios_1.default.post("https://web2.login.cornell.edu/" + loginAction, encodeForm({
                            'netid': netid,
                            'password': password,
                        }), {
                            maxRedirects: 0,
                            jar: cookieJar
                        })];
                case 3:
                    ret = _a.sent();
                    dom = new jsdom_1.JSDOM(ret.data);
                    cont = findFormByName(dom, 'bigpost').action;
                    wa = findInputByName(dom, 'wa').value;
                    return [4 /*yield*/, axios_1.default.post(cont, encodeForm({
                            'wa': wa,
                        }), { jar: cookieJar })];
                case 4:
                    ret = _a.sent();
                    // Continue button
                    dom = new jsdom_1.JSDOM(ret.data);
                    _cont = dom.window.document.querySelector("form");
                    if (_cont == null)
                        throw 'unable to find form';
                    cont = _cont.action;
                    relayState = findInputByName(dom, 'RelayState').value;
                    samlResp = findInputByName(dom, 'SAMLResponse').value;
                    return [4 /*yield*/, axios_1.default.post(cont, encodeForm({
                            'RelayState': relayState,
                            'SAMLResponse': samlResp,
                        }), {
                            maxRedirects: 0,
                            jar: cookieJar
                        }).catch(function (e) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, axios_1.default.get(e.response.headers.location, { jar: cookieJar })];
                                    case 1:
                                        ret = _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 5:
                    _a.sent();
                    return [2 /*return*/, cookieJar];
            }
        });
    });
}
exports.login = login;
function dailyCheckStatus(cookieJar) {
    return __awaiter(this, void 0, void 0, function () {
        var ret, dom, statusBanner, isGreen;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.get('https://dailycheck.cornell.edu', {
                        jar: cookieJar
                    })];
                case 1:
                    ret = _a.sent();
                    dom = new jsdom_1.JSDOM(ret.data);
                    statusBanner = dom.window.document.querySelector(".dc-status-banner");
                    isGreen = false;
                    if (statusBanner != null)
                        isGreen = statusBanner.textContent == 'Complete';
                    return [2 /*return*/, isGreen ? "Checked in." : "Not checked-in. Use `--checkin` to check in."];
            }
        });
    });
}
exports.dailyCheckStatus = dailyCheckStatus;
function dailyCheck(cookieJar) {
    return __awaiter(this, void 0, void 0, function () {
        var ret, dom, _token, token, _1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.get('https://dailycheck.cornell.edu/daily-checkin', {
                        jar: cookieJar
                    }).catch(function (_) { return null; })];
                case 1:
                    ret = _a.sent();
                    if (ret === null) {
                        throw "error while fetching";
                    }
                    dom = new jsdom_1.JSDOM(ret.data);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    _token = findInputByName(dom, '_token');
                    console.log(_token + " done.");
                    token = _token.value;
                    console.log(token);
                    return [4 /*yield*/, axios_1.default.post('https://dailycheck.cornell.edu/dailypost', encodeForm({
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
                        })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _1 = _a.sent();
                    console.log("Already checked-in.");
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.dailyCheck = dailyCheck;
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var yargs, hideBin, argv, cookieJar, password, netid, _a, _b, _c, _d, e_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    yargs = require('yargs/yargs');
                    hideBin = require('yargs/helpers').hideBin;
                    argv = yargs(hideBin(process.argv)).argv;
                    cookieJar = new tough.CookieJar(new tough_cookie_file_store_1.FileCookieStore("./cookie.txt"));
                    password = fs.readFileSync(__dirname + "/.secret").toString().trim();
                    netid = fs.readFileSync(__dirname + "/.username").toString().trim();
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 7, , 8]);
                    if (!argv.checkin) return [3 /*break*/, 3];
                    _a = dailyCheck;
                    return [4 /*yield*/, login(cookieJar, netid, password)];
                case 2:
                    _a.apply(void 0, [_e.sent()]);
                    return [3 /*break*/, 6];
                case 3:
                    if (!argv.status) return [3 /*break*/, 6];
                    _c = (_b = console).log;
                    _d = dailyCheckStatus;
                    return [4 /*yield*/, login(cookieJar, netid, password)];
                case 4: return [4 /*yield*/, _d.apply(void 0, [_e.sent()])];
                case 5:
                    _c.apply(_b, [_e.sent()]);
                    _e.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    e_1 = _e.sent();
                    console.log(e_1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    main();
}
//# sourceMappingURL=dailycheck.js.map