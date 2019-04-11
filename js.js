/**
 * Check empty arg(s)
 *
 * @returns {boolean}
 */
function isEmpty() {
    var empty = true;
    for (var i = 0; i < arguments.length; i++) {
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
Array.range = function (first, last, step) {
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
    var w = [];
    for (var key in obj) {
        var value = obj[key];
        if (value instanceof Function) {
            continue;
        }
        var newCursor = cursor;
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
var tableToExcel = (function () {

    var uri = 'data:application/vnd.ms-excel;base64,';
    var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>';
    var base64 = function (s) {
        return window.btoa(unescape(encodeURIComponent(s)))
    };
    var format = function (s, c) {
        return s.replace(/{(\w+)}/g, function (m, p) {
            return c[p];
        })
    };
    var downloadURI = function (uri, name) {
        var link = document.createElement("a");
        link.download = name;
        link.href = uri;
        link.click();
    };

    return function (table, name, fileName) {
        if (!table.nodeType) table = document.getElementById(table);
        var ctx = {worksheet: name || 'Worksheet', table: table.innerHTML};
        var resuri = uri + base64(format(template, ctx));
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
    var b = this[indexFirst];
    this[indexFirst] = this[indexSecond];
    this[indexSecond] = b;
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
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
    var obj = {};

    if (queryString) {
        queryString = queryString.split('#')[0];
        var arr = queryString.split('&');
        for (var i = 0; i < arr.length; i++) {
            var a = arr[i].split('=');
            var paramName = a[0];
            var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
            if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();
            if (paramName.match(/\[(\d+)?\]$/)) {
                var key = paramName.replace(/\[(\d+)?\]/, '');
                if (!obj[key]) obj[key] = [];
                if (paramName.match(/\[\d+\]$/)) {
                    var index = /\[(\d+)\]/.exec(paramName)[1];
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
