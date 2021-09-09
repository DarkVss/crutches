const HOST = "http://192.168.0.66";
const HEADERS = {
    Accept         : "application/json",
    "Content-Type" : "application/json"
};

const REQUEST_GET = "GET";
const REQUEST_POST = "POST";
const REQUEST_PUT = "PUT";
const REQUEST_PATCH = "PATCH";
const REQUEST_DELETE = "DELETE";

export default class Request {
    /**
     * Request generator
     * @param {Component} context
     * @param {string} type - look at const REQUEST_*
     * @param {array} url
     * @param {null|object} getParams
     * @param {object} specificHeaders
     * @param {boolean} withLoader
     * @param {function} resolve
     * @param {function} reject
     *
     * @return XMLHttpRequest
     */
    static __request(context, type, url, getParams, specificHeaders, withLoader, resolve, reject) {
        if (withLoader === true) {
                context.setState({ showLoader : true });
        }

        let subway = urlConstructor(true, getParams === null ? {} : getParams, "");
        subway = (subway.length === 0) ? '' : "?" + subway.join("&");
        let endpoint = `${HOST}/${url.join("/")}${subway}`;

        delete specificHeaders["Accept"];
        delete specificHeaders["Content-Type"];
        Object.assign(HEADERS, specificHeaders);

        let xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.open(type, endpoint);
        Object.keys(HEADERS).forEach(
            (key) => {
                xhr.setRequestHeader(key, HEADERS[key]);
            }
        )
        xhr.onload = function () {
            if (xhr.response === null) {
                alert("Не удалось разобрать ответ сервера");
                reject();
            } else {
                resolve(xhr.response);
            }

            if (withLoader === true) {
                context.setState({ showLoader : false });
            }
        };
        xhr.onerror = function () {
            if (withLoader === true) {
                context.setState({ showLoader : false });
            }

            alert("Не возможно обработать ответ Сервера");
            reject();
        };

        return xhr;
    }

    /**
     * GET Request
     * @param {Component} context
     * @param {array} url
     * @param {null|object} getParams
     * @param {object} specificHeaders
     * @param {boolean} withLoader
     * @constructor
     */
    static GET(context, url, getParams = {}, specificHeaders = {}, withLoader = true) {
        return new Promise(function (resolve, reject) {
            try {
                Request.__request(context, REQUEST_GET, url, getParams, specificHeaders, withLoader, resolve, reject).send();
            } catch ( e ) {
                if (withLoader === true) {
                    context.setState({ showLoader : false });
                }
                alert("Не удалось отправить запрос Серверу");
            }
        });
    };

    /**
     * POST Request
     * @param {Component} context
     * @param {array} url
     * @param {object} data
     * @param {null|object} getParams
     * @param {object} specificHeaders
     * @param {boolean} withLoader
     * @constructor
     */
    static POST(context, url, data = {}, getParams = {}, specificHeaders = {}, withLoader = true) {
        return new Promise(function (resolve, reject) {
            try {
                Request.__request(context, REQUEST_POST, url, getParams, specificHeaders, withLoader, resolve, reject).send(typeof data === "object" ? JSON.stringify(data) : null);
            } catch ( e ) {
                if (withLoader === true) {
                    context.setState({ showLoader : false });
                }
                alert("Не удалось отправить запрос Серверу");
            }
        });
    }

    /**
     * PUT Request
     * @param {Component} context
     * @param {array} url
     * @param {object} data
     * @param {null|object} getParams
     * @param {object} specificHeaders
     * @param {boolean} withLoader
     * @constructor
     */
    static PUT(context, url, data = {}, getParams = {}, specificHeaders = {}, withLoader = true) {
        return new Promise(function (resolve, reject) {
            try {
                Request.__request(context, REQUEST_PUT, url, getParams, specificHeaders, withLoader, resolve, reject).send(typeof data === "object" ? JSON.stringify(data) : null);
            } catch ( e ) {
                if (withLoader === true) {
                    context.setState({ showLoader : false });
                }
                alert("Не удалось отправить запрос Серверу");
            }
        });
    }

    /**
     * PATCH Request
     * @param {Component} context
     * @param {array} url
     * @param {object} data
     * @param {null|object} getParams
     * @param {object} specificHeaders
     * @param {boolean} withLoader
     * @constructor
     */
    static PATCH(context, url, data = {}, getParams = {}, specificHeaders = {}, withLoader = true) {
        return new Promise(function (resolve, reject) {
            try {
                Request.__request(context, REQUEST_PATCH, url, getParams, specificHeaders, withLoader, resolve, reject).send(typeof data === "object" ? JSON.stringify(data) : null);
            } catch ( e ) {
                if (withLoader === true) {
                    context.setState({ showLoader : false });
                }
                alert("Не удалось отправить запрос Серверу");
            }
        });
    }

    /**
     * DELETE Request
     * @param {Component} context
     * @param {array} url
     * @param {null|object} getParams
     * @param {object} specificHeaders
     * @param {boolean} withLoader
     * @constructor
     */
    static DELETE(context, url, getParams = {}, specificHeaders = {}, withLoader = true) {
        return new Promise(function (resolve, reject) {
            try {
                Request.__request(context, REQUEST_DELETE, url, getParams, specificHeaders, withLoader, resolve, reject).send();
            } catch ( e ) {
                if (withLoader === true) {
                    context.setState({ showLoader : false });
                }
                alert("Не удалось отправить запрос Серверу");
            }
        });
    };
};

/**
 * Url constructor
 *
 * @param {boolean} emptyGetParams - value for GET-params can be empty or not
 * @param {object} obj - key=value
 * @param {string} cursor - for difficult params multiFold
 *
 * @returns {Array} - Object for join("&")
 */
const urlConstructor = (emptyGetParams, obj, cursor) => {
    let w = [];
    for (let key in obj) {
        let value = obj[key];
        if (value instanceof Function) {
            continue;
        }
        let newCursor = cursor;
        if (key.toUpperCase !== undefined) {
            newCursor += (newCursor.length === 0) ? key : (parseInt(key) + "" === key ? "[]" : "[" + key + "]");
        } else {
            newCursor += "[]";
        }
        if (value !== undefined && value !== null && (value.__proto__.constructor === Array || value.__proto__.constructor === Object)) {
            (arguments.callee(emptyGetParams, value, newCursor)).forEach(function (value) {
                w.push(value);
            })
        } else if (emptyGetParams || (!emptyGetParams && value !== "" && value !== undefined)) {
            w.push(newCursor + "=" + value);
        }
    }
    return w;
}

/**
 * Usage:
 *
 * click = () => Alert.alert(
 *    "Get Data Window",
 *    "U really wanna to get data?",
 *    [
 *        {
 *            text    : "Cancel",
 *            style   : "cancel",
 *            onPress : () => console.log("Cancel Pressed"),
 *        },
 *        {
 *            text    : "OK",
 *            onPress : () => {
 *                let self = this;
 *
 *                Request.POST(
 *                    this,
 *                    ["request.php"],
 *                    { "action" : "meow", "data" : [1, 2, 3, 54, 56,] },
 *                    {},
 *                    {},
 *                    true
 *                ).then(function (result) {
 *                    if (result !== false) {
 *                        console.log(result);
 *                    }
 *                });
 *            },
 *        },
 *    ]
 *);
*/
