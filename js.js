/**
 * Safety get value from nested object
 *
 * @param {array} way - way to value
 * @param {object} object
 *
 * @return undefined|mixed - NULL - not found, otherwise return desired value
 */
const safetyNestedObjectValue = (way, object) => {
    return way.reduce((xs, x) => (xs && xs[x]) ? xs[x] : undefined, object);
}

/**
 * Check empty arg(s)
 *
 * @returns {boolean}
 */
function isEmpty() {
    let empty = true;
    for (let i = 0; i < arguments.length; i++) {
        empty = empty && (
                arguments[i] === false ||
                arguments[i] === "false" ||
                arguments[i] === undefined ||
                arguments[i] === null ||
                arguments[i] === 0 ||
                arguments[i] === "0" ||
                arguments[i].length === 0 ||
                (Object.keys(arguments[i]).length === 0 && ["Number", "Date", "Boolean"].indexOf(arguments[i].__proto__.constructor.name) === -1)
            );
    }
    return empty;
}

/**
 * Step by step filling in the array values ​​from the minimum to the maximum value
 *
 * @param first integer|float minimal value
 * @param last integer|float maximal value
 * @param step integer|float step increase value
 *
 * @returns {Array}
 */
Array.range = function (first, step, last) {
    var output = [];
    if (first !== undefined && last !== undefined) {
        if (first > last) {
            var tempLast = first;
            first = last;
            last = tempLast;
            // OR just this -
            // first += last;
            // last = first - last;
            // first -= last;
        }

        for (; first <= last; first += step) {
            output.push(first);
        }
    }
    return output;
};

/**
 * Url constructor
 *
 * @param emptyGetParams - value can be empty or not
 * @param obj - key=value
 * @param cursor - for difficult params multiFold
 *
 * @returns {Array} - Object for join("&")
 */
function urlConstructor(emptyGetParams, obj, cursor) {
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
        if (value !== undefined && (value.__proto__.constructor === Array || value.__proto__.constructor === Object)) {
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
 * Export html table from page to xls file
 * use like `tableToExcel('tableID', 'SheetName', 'FileName.xls');`
 */
let tableToExcel = (function () {
    const uri = "data:application/vnd.ms-excel;base64,";
    let template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>';
    let base64 = function (s) {
        return window.btoa(unescape(encodeURIComponent(s)))
    };
    let format = function (s, c) {
        return s.replace(/{(\w+)}/g, function (m, p) {
            return c[p];
        })
    };
    let downloadURI = function (uri, name) {
        let link = document.createElement("a");
        link.download = name;
        link.href = uri;
        link.click();
    };

    return function (table, name, fileName) {
        if (!table.nodeType) table = document.getElementById(table);
        let ctx = {worksheet: name || "Worksheet", table: table.innerHTML};
        let resuri = uri + base64(format(template, ctx));
        downloadURI(resuri, fileName);
    }
})();

//TODO: need associate with __proto__
/**
 * String formatting
 *
 * @param mask string - for example `+X(XXX) XXX-XX-XX`
 * @param data string|number
 *
 * @returns {string}
 */
function format(mask, data) {
    var source = '' + data.toString();
    var result = '';
    mask = mask.toUpperCase();

    for (var maskIndex = 0, sourceIndex = 0; maskIndex < mask.length && sourceIndex < source.length; maskIndex++) {
        result += mask.charAt(maskIndex) === 'X' ?
            source.charAt(sourceIndex++) :
            mask.charAt(maskIndex);
    }

    return result;
}
String.prototype.replaceAll = function (find, replace_to) {
    return this.replace(new RegExp(find, "g"), replace_to);
};

Array.prototype.swapElements = function (indexFirst, indexSecond) {
    let b = this[indexFirst];
    this[indexFirst] = this[indexSecond];
    this[indexSecond] = b;
    return this;
};

//TODO: upgrade it to more general
function pad(n) {
    return n < 10 ? "0" + n : n;
}


/**
 * Get GET-params from current page url or string (one depth level)
 *
 * @param {string} url
 *
 * @returns {Object}
 */
function getGetParams(url) {
    let queryString = url ? url.split("?")[1] : window.location.search.slice(1);
    let getParams = {};

    if (queryString) {
        queryString = queryString.split("#")[0];

        getParams = parseQueryParams(queryString);
    }

    return getParams;
}

/**
 * Parse query params (one depth level)
 *
 * @param {string} queryString
 *
 * @returns {Object}
 */
function parseQueryParams(queryString) {
    let queryParams = {};

    let arr = queryString.split("&");
    for (let i = 0; i < arr.length; i++) {
        let a = arr[i].split("=");
        let paramName = a[0];
        let paramValue = typeof (a[1]) === "undefined" ? true : a[1];
        if (paramName.match(/\[(\d+)?\]$/)) {
            let key = paramName.replace(/\[(\d+)?\]/, "");
            if (!queryParams[key]) queryParams[key] = [];
            if (paramName.match(/\[\d+\]$/)) {
                let index = /\[(\d+)\]/.exec(paramName)[1];
                queryParams[key][index] = decodeURIComponent(paramValue);
            } else {
                queryParams[key].push(decodeURIComponent(paramValue));
            }
        } else {
            if (!queryParams[paramName]) {
                queryParams[paramName] = decodeURIComponent(paramValue);
            } else if (queryParams[paramName] && typeof queryParams[paramName] === "string") {
                queryParams[paramName] = [decodeURIComponent(queryParams[paramName])];
                queryParams[paramName].push(decodeURIComponent(paramValue));
            } else {
                queryParams[paramName].push(decodeURIComponent(paramValue));
            }
        }
    }

    return queryParams;
}

/**
 * Build query params (one depth level)
 *
 * @param {object} params
 *
 * @returns {Object}
 */
function buildQueryParams(params) {
    let queryArray = [];

    Object.keys(params).forEach((key) => {
        queryArray.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
    });

    return queryArray.join("&");
}

/**
 * @param {string} dataString YYYY-MM-DD HH:II:SS
 *
 * @return {Date|null}
 */
/**
 * @param {string} dataString YYYY-MM-DD HH:II:SS
 *
 * @return {Date|null}
 */
function parseDate(dataString) {
    let date = null;

    if (!isEmpty(dataString)) {
        const pattern = /\d+/g;
        let data = dataString.match(pattern);
        if (data !== null && data.length >= 3) {
            for (var index = 0; index < 6; index++) {
                data[index] = isEmpty(data[index]) ? "00" : data[index];
            }

            date = new Date(data[0], data[1] - 1, data[2], data[3], data[4], data[5]);
        }
    }

    return date;
}


/**
 * Get count element of object
 *
 * @param {Object} object
 * @returns {*}
 */
function countObject(object) {
    return isEmpty(object) ? 0 : Object.keys(object).length;
}

/**
 * Get object key by value
 *
 * @param {int|string|boolean|object|array} val
 * @return {string}
 */
Object.prototype.getKeyByValue = function (val) {
    let key = undefined;
    let index = Object.values(this).indexOf(val);
    if (index !== -1) {
        key = Object.keys(this)[index];
    }

    return key;
};

/**
 *
 * @param file
 * @returns base64 encoded file
 */

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

/**
 * Copy text to clipboard
 * @param {string} text
 * @param {string|null} copiedMessage - message after successful coping, default - <b>Значение скопированно</b>
 */
function toCLipboard(text = '') {
    if (!isEmpty(text)) {
        let el = document.createElement("textarea");
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
    }
}

/**
* Notice builder
*
* In page must be element with ID equal `notice`
*
* Markup:
*  <div id="notice-container"></div>
*
* Classes:
*  #notice-container {
*     width: 350px;
*     position: fixed;
*     right: 10px;
*     bottom: 10px;
*     z-index: 99999999999;
*  }
*
*  .notice-message {
*     display: flex;
*     align-items: center;
*     margin-top: 5px;
*     padding: 1em 1em;
*     border-radius: 5px;
*     font-weight: bolder;
*     cursor: default;
*     text-align: center;
*     transition: opacity 1000ms linear;
*     position: relative;
*  }
*
*  .notice-close {
*     position: absolute;
*     top: 0;
*     right: 0.25em;
*     cursor: pointer;
*  }
*
*  .notice-close:hover {
*     text-shadow: 0 0 4px white;
*  }
*
*  .notice-close:before {
*     content: "✕";
*     font-size: 1.4em;
*  }
*
*  .notice-icon {
*     margin-right: 15px;
*     font-size: 30px;
*     font-weight: normal;
*     opacity: 0.8;
*  }
*
*  .notice-icon::before {
*     content: "";
*     font-family: "Material Design Icons";
*  }
*
*  .notice-icon_error::before {
*     content: "\F0028";
*  }
*
*  .notice-icon_warning::before {
*     content: "\F0026";
*  }
*
*  .notice-icon_success::before {
*     content: "\F05E0";
*  }
*
*  .notice-icon_info::before {
*     content: "\F02FC";
*  }
*
*  .notice-error {
*     color: #fff;
*     background-color: var(--color-red);
*  }
*
*  .notice-warning {
*     color: #fff;
*     background-color: #ffb100;
*  }
*
*  .notice-info {
*     color: #fff;
*     background-color: var(--color-blue);
*  }
*
*  .notice-success {
*     color: #fff;
*     background-color: var(--color-green);
*  }
*/
let NoticeBuilder = function () {
    let DisableTimeout;
    let IsInfo = false;
    let IsSuccess = false;
    let IsWarning = false;
    let IsError = true;
    let Message = "Неизвестная ошибка";
    let ActionAfter = null;


    return {
        /**
         * Set timeout before notice will be removed
         *
         * @param disableTimeout    milliseconds
         *
         * @return {NoticeBuilder}
         */
        setDisableTimeout : function (disableTimeout) {
            this.DisableTimeout = disableTimeout;

            return this;
        },
        /**
         * Set what is notice Info
         *
         * @return {NoticeBuilder}
         */
        isInfo            : function () {
            this.IsInfo = true;
            this.IsSuccess = false;
            this.IsWarning = false;
            this.IsError = false;
            this.ActionAfter = null;

            return this;
        },
        /**
         * Set what is notice Success
         *
         * @return {NoticeBuilder}
         */
        isSuccess         : function () {
            this.IsInfo = false;
            this.IsSuccess = true;
            this.IsWarning = false;
            this.IsError = false;
            this.ActionAfter = null;

            return this;
        },
        /**
         * Set what is notice Warning
         *
         * @return {NoticeBuilder}
         */
        isWarning         : function () {
            this.IsInfo = false;
            this.IsSuccess = false;
            this.IsWarning = true;
            this.IsError = false;
            this.ActionAfter = null;

            return this;
        },
        /**
         * Set what is notice Error
         *
         * @return {NoticeBuilder}
         */
        isError           : function () {
            this.IsInfo = false;
            this.IsSuccess = false;
            this.IsWarning = false;
            this.IsError = true;
            this.ActionAfter = null;

            return this;
        },
        /**
         * Set message of notice
         *
         * @return {NoticeBuilder}
         */
        setMessage        : function (message) {
            if (!isEmpty(message)) {
                this.Message = message;
            }

            return this;
        },
        /**
         * Set action after message will deletion
         *
         * @return {NoticeBuilder}
         */
        setActionAfter    : function (actionAfter) {
            if (typeof actionAfter === "function") {
                this.ActionAfter = actionAfter;
                console.log("set", this.ActionAfter);
            } else {
                console.log("no set");
            }
            return this;
        },
        show              : function () {
            let noticeContainer = document.getElementById("notice");

            if (noticeContainer !== null) {
                if (isEmpty(this.DisableTimeout)) {
                    this.DisableTimeout = 3 * 1000;
                }
                if (isEmpty(this.Message)) {
                    this.Message = 'Неизвестная ошибка';
                }

                let noticeClass = this.IsInfo ? "info" : (
                    this.IsSuccess ? "success" : (
                        this.IsWarning ? "warning" : "error"
                    )
                );

                let uniqueClass = `cl${parseInt(new Date().getTime() / 1000, 10)}`;

                let noticeWrapper = document.createElement("div");
                let noticeCloser = document.createElement("div");
                let noticeIcon = document.createElement("div");
                let noticeMessage = document.createElement("div");

                noticeWrapper.setAttribute("class", `notice ${noticeClass} ${uniqueClass}`);
                noticeCloser.setAttribute("class", `notice-close`);
                noticeCloser.setAttribute("onclick", `document.getElementsByClassName("${uniqueClass}")[0].remove()`);
                noticeIcon.setAttribute("class", `icon icon-${noticeClass}`);
                noticeMessage.setAttribute("class", `notice__text`);
                noticeMessage.innerHTML = this.Message;

                noticeWrapper.appendChild(noticeCloser);
                noticeWrapper.appendChild(noticeIcon);
                noticeWrapper.appendChild(noticeMessage);

                noticeContainer.appendChild(noticeWrapper);

                const ActionAfter = this.ActionAfter;

                setTimeout(function () {
                    noticeWrapper.remove();
                    if (typeof ActionAfter === "function") {
                        ActionAfter();
                    }
                }, this.DisableTimeout);
            }
        },
    };
};
const action = () => { alert("world"); };
NoticeBuilder().isSuccess().setMessage("hello").setDisableTimeout(4000).setActionAfter(action).show()
NoticeBuilder().isSuccess().setMessage("hello").setDisableTimeout(4000).show()
NoticeBuilder().isSuccess().setMessage("hello").show() // default timeout = 3 * 1000 ms

class Loader {
    /**
     * @param id {string} ID loader block
     */
    constructor(id = "loader") {
        this.loader = document.getElementById(id);
        if (this.loader === null) {
            this.loader = document.getElementById("loader");
        }
    }

    show() {
        if (this.loader !== null) {
            this.loader.classList.remove("hidden");
        }
    }

    hide() {
        if (this.loader !== null) {
            this.loader.classList.add("hidden");
        }
    }
}

/**
* Call functions in turn
* e.g. multi-call
*/
x = (params,...after)=>{if (!Array.isArray(params)) {params = [];}let param = params.shift() || [];alert("x");if(after.length!==0){after.shift()({},...after);}};
y = (params,...after)=>{if (!Array.isArray(params)) {params = [];}let param = params.shift() || [];alert("y");if(after.length!==0){after.shift()({},...after);}};
z = (params,...after)=>{if (!Array.isArray(params)) {params = [];}let param = params.shift() || [];alert("z");if(after.length!==0){after.shift()({},...after);}};
c = (params,...after)=>{if (!Array.isArray(params)) {params = [];}let param = params.shift() || [];alert("c");if(after.length!==0){after.shift()({},...after);}};

x(
    [],
    z,
    y,
    c
);

/**
 * Class for run some function by interval(ms)
 */
class IntervalFunction {
    /**
     * @param {function} callback function for execution
     * @param {int} interval milliseconds interval for execute
     */
    constructor(callback, interval) {
        this.callback = callback;
        this.interval = interval;
    }

    /**
     * @param {bool} immediatelyRun immediately run function
     */
    run(immediatelyRun = false) {
        if(immediatelyRun === true) {
            this.callback();
        }
        this.intervalID = setInterval(this.callback, this.interval);
    }

    stop() {
        if (isEmpty(this.intervalID) === false) {
            clearInterval(this.intervalID);
            this.intervalID = null;
        }
    }
}

/**
 * Screenshot by `html2canvas` lib (https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js -> ./jsLibs/html2canvas.min.js)
 */
function screenshot() {
    let target = document.getElementById("<TARGET_ID>") || document.getElementsByClassName("<TARGET_CLASS>")[0];

    if (target !== undefined) {
        html2canvas(target, {
            onrendered : function (canvas) {
                const now = new Date();

                const downloadLink = document.createElement("a");
                downloadLink.href = "data:image/png;base64,"+canvas.toDataURL().replace("data:image/png;base64,", '');
                downloadLink.download = `Screenshot(${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())})`;

                downloadLink.click();
            },
        });
    }
}

/**
 * Validate contact
 *
 * @param {string} type **email/phone/`something`**
 * @param {string} value validate stirng
 *
 * @returns {boolean|string} FALSE - invalid string, otherwise validated string
 */
function validateContact(type, value) {
    value += '';
    switch ( type ) {
        case "phone": {
            value = value.replaceAll(/[^0-9]/, '');

            if (value.length == 11) {
                if (value[0] == "8") {
                    value[0] = "7";
                }
            } else if (value.length == 10) {
                value = "7" + value;
            } else {
                return false;
            }
        }
            break;
        case "email": {
            let matches = value.match(/([\_a-zA-Z0-9-\.]+)@([a-zA-Z0-9-\.\_]+)(\.[a-zA-Z]{2,20})/);
            if (matches === null || matches.length !== 4 || matches[0] !== matches.input) {
                return false;
            }
        }
            break;
        default: {
            if (value.length === 0) {
                return false;
            }
        }
            break;
    }

    return value;
}


window.addEventListener("resize", () => {
    clearTimeout(window.resizeTimeout);

    window.resizeTimeout = setTimeout(resizeFunction, 200)
});
