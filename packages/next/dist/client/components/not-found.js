"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    notFound: null,
    isNotFoundError: null,
    customResponseCodeError: null,
    isCustomResponseCodeError: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    notFound: function() {
        return notFound;
    },
    isNotFoundError: function() {
        return isNotFoundError;
    },
    customResponseCodeError: function() {
        return customResponseCodeError;
    },
    isCustomResponseCodeError: function() {
        return isCustomResponseCodeError;
    }
});
const NOT_FOUND_ERROR_CODE = "NEXT_NOT_FOUND";
function notFound() {
    // eslint-disable-next-line no-throw-literal
    const error = new Error(NOT_FOUND_ERROR_CODE);
    error.digest = NOT_FOUND_ERROR_CODE;
    throw error;
}
function isNotFoundError(error) {
    return (error == null ? void 0 : error.digest) === NOT_FOUND_ERROR_CODE;
}
function customResponseCodeError(status) {
    const error = new Error("CUSTOM_RESPONSE_CODE_ERROR-" + status);
    error.status = status;
    throw error;
}
function isCustomResponseCodeError(error) {
    return /^CUSTOM_RESPONSE_CODE_ERROR-([\d+]{3})$/g.test(error == null ? void 0 : error.digest);
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=not-found.js.map