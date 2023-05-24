"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    resolveImages: null,
    resolveOpenGraph: null,
    resolveTwitter: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    resolveImages: function() {
        return resolveImages;
    },
    resolveOpenGraph: function() {
        return resolveOpenGraph;
    },
    resolveTwitter: function() {
        return resolveTwitter;
    }
});
const _utils = require("../generate/utils");
const _resolveurl = require("./resolve-url");
const OgTypeFields = {
    article: [
        "authors",
        "tags"
    ],
    song: [
        "albums",
        "musicians"
    ],
    playlist: [
        "albums",
        "musicians"
    ],
    radio: [
        "creators"
    ],
    video: [
        "actors",
        "directors",
        "writers",
        "tags"
    ],
    basic: [
        "emails",
        "phoneNumbers",
        "faxNumbers",
        "alternateLocale",
        "audio",
        "videos"
    ]
};
function resolveImages(images, metadataBase) {
    var _resolveAsArrayOrUndefined;
    return (_resolveAsArrayOrUndefined = (0, _utils.resolveAsArrayOrUndefined)(images)) == null ? void 0 : _resolveAsArrayOrUndefined.map((item)=>{
        if ((0, _resolveurl.isStringOrURL)(item)) {
            return {
                url: (0, _resolveurl.resolveUrl)(item, metadataBase)
            };
        } else {
            return {
                ...item,
                // Update image descriptor url
                url: (0, _resolveurl.resolveUrl)(item.url, metadataBase)
            };
        }
    });
}
function getFieldsByOgType(ogType) {
    switch(ogType){
        case "article":
        case "book":
            return OgTypeFields.article;
        case "music.song":
        case "music.album":
            return OgTypeFields.song;
        case "music.playlist":
            return OgTypeFields.playlist;
        case "music.radio_station":
            return OgTypeFields.radio;
        case "video.movie":
        case "video.episode":
            return OgTypeFields.video;
        default:
            return OgTypeFields.basic;
    }
}
const resolveOpenGraph = (openGraph, metadataBase)=>{
    if (!openGraph) return null;
    const url = (0, _resolveurl.resolveUrl)(openGraph.url, metadataBase);
    const resolved = {
        ...openGraph
    };
    function assignProps(og) {
        const ogType = og && "type" in og ? og.type : undefined;
        const keys = getFieldsByOgType(ogType);
        for (const k of keys){
            const key = k;
            if (key in og && key !== "url") {
                const value = og[key];
                if (value) {
                    const arrayValue = (0, _utils.resolveAsArrayOrUndefined)(value);
                    resolved[key] = arrayValue;
                }
            }
        }
        const imageMetadataBase = (0, _resolveurl.getSocialImageFallbackMetadataBase)(metadataBase);
        resolved.images = resolveImages(og.images, imageMetadataBase);
    }
    assignProps(openGraph);
    resolved.url = url;
    return resolved;
};
const TwitterBasicInfoKeys = [
    "site",
    "siteId",
    "creator",
    "creatorId",
    "description"
];
const resolveTwitter = (twitter, metadataBase)=>{
    if (!twitter) return null;
    const resolved = {
        ...twitter,
        card: "card" in twitter ? twitter.card : "summary"
    };
    for (const infoKey of TwitterBasicInfoKeys){
        resolved[infoKey] = twitter[infoKey] || null;
    }
    const imageMetadataBase = (0, _resolveurl.getSocialImageFallbackMetadataBase)(metadataBase);
    resolved.images = resolveImages(twitter.images, imageMetadataBase);
    if ("card" in resolved) {
        switch(resolved.card){
            case "player":
                {
                    resolved.players = (0, _utils.resolveAsArrayOrUndefined)(resolved.players) || [];
                    break;
                }
            case "app":
                {
                    resolved.app = resolved.app || {};
                    break;
                }
            default:
                break;
        }
    }
    return resolved;
};

//# sourceMappingURL=resolve-opengraph.js.map