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
 * Get GET-params from current page url or string
 * 
 * @param url string
 * 
 * @returns {Object}
 */
function getGetParams(url) {
    let queryString = url ? url.split('?')[1] : window.location.search.slice(1);
    let obj = {};

    if (queryString) {
        queryString = queryString.split('#')[0];
        let arr = queryString.split('&');
        for (let i = 0; i < arr.length; i++) {
            let a = arr[i].split('=');
            let paramName = a[0];
            let paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
            if (paramName.match(/\[(\d+)?\]$/)) {
                let key = paramName.replace(/\[(\d+)?\]/, '');
                if (!obj[key]) obj[key] = [];
                if (paramName.match(/\[\d+\]$/)) {
                    let index = /\[(\d+)\]/.exec(paramName)[1];
                    obj[key][index] = paramValue;
                } else {
                    obj[key].push(paramValue);
                }
            } else {
                if (!obj[paramName]) {
                    obj[paramName] = paramValue;
                } else if (obj[paramName] && typeof obj[paramName] === 'string') {
                    obj[paramName] = [obj[paramName]];
                    obj[paramName].push(paramValue);
                } else {
                    obj[paramName].push(paramValue);
                }
            }
        }
    }

    return obj;
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
 * Notice builder
 *
 * In page must be element with ID equal `notice`
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
                let noticeIcon = document.createElement("div");
                let noticeMessage = document.createElement("div");

                noticeWrapper.setAttribute("class", `notice ${noticeClass} ${uniqueClass}`);
                noticeIcon.setAttribute("class", `icon icon-${noticeClass}`);
                noticeMessage.setAttribute("class", `notice__text`);
                noticeMessage.innerHTML = this.Message;

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
