"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    batcher: null,
    default: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    batcher: function() {
        return batcher;
    },
    default: function() {
        return _default;
    }
});
const _crypto = require("crypto");
const _shared = require("../shared");
const _fs = /*#__PURE__*/ _interop_require_default(require("fs"));
const _path = /*#__PURE__*/ _interop_require_default(require("path"));
const _constants = require("../../shared/lib/constants");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const localEndpoint = {
    serviceName: "nextjs",
    ipv4: "127.0.0.1",
    port: 9411
};
function batcher(reportEvents) {
    const events = [];
    // Promise queue to ensure events are always sent on flushAll
    const queue = new Set();
    return {
        flushAll: async ()=>{
            await Promise.all(queue);
            if (events.length > 0) {
                await reportEvents(events);
                events.length = 0;
            }
        },
        report: (event)=>{
            events.push(event);
            if (events.length > 100) {
                const evts = events.slice();
                events.length = 0;
                const report = reportEvents(evts);
                queue.add(report);
                report.then(()=>queue.delete(report));
            }
        }
    };
}
let writeStream;
let traceId;
let batch;
const writeStreamOptions = {
    flags: "a",
    encoding: "utf8"
};
class RotatingWriteStream {
    constructor(file, sizeLimit){
        this.file = file;
        this.size = 0;
        this.sizeLimit = sizeLimit;
        this.createWriteStream();
    }
    createWriteStream() {
        this.writeStream = _fs.default.createWriteStream(this.file, writeStreamOptions);
    }
    // Recreate the file
    async rotate() {
        await this.end();
        try {
            _fs.default.unlinkSync(this.file);
        } catch (err) {
            // It's fine if the file does not exist yet
            if (err.code !== "ENOENT") {
                throw err;
            }
        }
        this.size = 0;
        this.createWriteStream();
        this.rotatePromise = undefined;
    }
    async write(data) {
        if (this.rotatePromise) await this.rotatePromise;
        this.size += data.length;
        if (this.size > this.sizeLimit) {
            await (this.rotatePromise = this.rotate());
        }
        if (!this.writeStream.write(data, "utf8")) {
            if (this.drainPromise === undefined) {
                this.drainPromise = new Promise((resolve, _reject)=>{
                    this.writeStream.once("drain", ()=>{
                        this.drainPromise = undefined;
                        resolve();
                    });
                });
            }
            await this.drainPromise;
        }
    }
    end() {
        return new Promise((resolve)=>{
            this.writeStream.end(resolve);
        });
    }
}
const reportToLocalHost = (name, duration, timestamp, id, parentId, attrs, startTime)=>{
    const distDir = _shared.traceGlobals.get("distDir");
    const phase = _shared.traceGlobals.get("phase");
    if (!distDir || !phase) {
        return;
    }
    if (!traceId) {
        traceId = process.env.TRACE_ID || (0, _crypto.randomBytes)(8).toString("hex");
    }
    if (!batch) {
        batch = batcher(async (events)=>{
            if (!writeStream) {
                await _fs.default.promises.mkdir(distDir, {
                    recursive: true
                });
                const file = _path.default.join(distDir, "trace");
                writeStream = new RotatingWriteStream(file, // Development is limited to 50MB, production is unlimited
                phase === _constants.PHASE_DEVELOPMENT_SERVER ? 52428800 : Infinity);
            }
            const eventsJson = JSON.stringify(events);
            try {
                await writeStream.write(eventsJson + "\n");
            } catch (err) {
                console.log(err);
            }
        });
    }
    batch.report({
        traceId,
        parentId,
        name,
        id,
        timestamp,
        duration,
        tags: attrs,
        startTime
    });
};
const _default = {
    flushAll: ()=>batch ? batch.flushAll().then(()=>{
            const phase = _shared.traceGlobals.get("phase");
            // Only end writeStream when manually flushing in production
            if (phase !== _constants.PHASE_DEVELOPMENT_SERVER) {
                writeStream.end();
            }
        }) : undefined,
    report: reportToLocalHost
};

//# sourceMappingURL=to-json.js.map