"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "eventCliSession", {
    enumerable: true,
    get: function() {
        return eventCliSession;
    }
});
const EVENT_VERSION = "NEXT_CLI_SESSION_STOPPED";
function eventCliSession(event) {
    // This should be an invariant, if it fails our build tooling is broken.
    if (typeof "13.4.4-canary.7" !== "string") {
        return [];
    }
    const payload = {
        nextVersion: "13.4.4-canary.7",
        nodeVersion: process.version,
        cliCommand: event.cliCommand,
        durationMilliseconds: event.durationMilliseconds,
        ...typeof event.turboFlag !== "undefined" ? {
            turboFlag: !!event.turboFlag
        } : {},
        pagesDir: event.pagesDir,
        appDir: event.appDir
    };
    return [
        {
            eventName: EVENT_VERSION,
            payload
        }
    ];
}

//# sourceMappingURL=session-stopped.js.map