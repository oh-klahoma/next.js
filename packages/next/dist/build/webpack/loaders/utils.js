"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    isClientComponentEntryModule: null,
    regexCSS: null,
    isCSSMod: null,
    getActions: null,
    generateActionId: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    isClientComponentEntryModule: function() {
        return isClientComponentEntryModule;
    },
    regexCSS: function() {
        return regexCSS;
    },
    isCSSMod: function() {
        return isCSSMod;
    },
    getActions: function() {
        return getActions;
    },
    generateActionId: function() {
        return generateActionId;
    }
});
const _crypto = require("crypto");
const _constants = require("../../../shared/lib/constants");
const imageExtensions = [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "avif",
    "ico",
    "svg"
];
const imageRegex = new RegExp(`\\.(${imageExtensions.join("|")})$`);
function isClientComponentEntryModule(mod) {
    const rscInfo = mod.buildInfo.rsc;
    const hasClientDirective = rscInfo == null ? void 0 : rscInfo.isClientRef;
    const isActionLayerEntry = (rscInfo == null ? void 0 : rscInfo.actions) && (rscInfo == null ? void 0 : rscInfo.type) === _constants.RSC_MODULE_TYPES.client;
    return hasClientDirective || isActionLayerEntry || imageRegex.test(mod.resource);
}
const regexCSS = /\.(css|scss|sass)(\?.*)?$/;
function isCSSMod(mod) {
    var _mod_loaders;
    return !!(mod.type === "css/mini-extract" || mod.resource && regexCSS.test(mod.resource) || ((_mod_loaders = mod.loaders) == null ? void 0 : _mod_loaders.some(({ loader  })=>loader.includes("next-style-loader/index.js") || loader.includes("mini-css-extract-plugin/loader.js") || loader.includes("@vanilla-extract/webpack-plugin/loader/"))));
}
function getActions(mod) {
    var _mod_buildInfo_rsc;
    return (_mod_buildInfo_rsc = mod.buildInfo.rsc) == null ? void 0 : _mod_buildInfo_rsc.actions;
}
function generateActionId(filePath, exportName) {
    return (0, _crypto.createHash)("sha1").update(filePath + ":" + exportName).digest("hex");
}

//# sourceMappingURL=utils.js.map