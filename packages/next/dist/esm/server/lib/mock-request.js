import Stream from "stream";
import { toNodeHeaders } from "../web/utils";
export class MockedRequest extends Stream.Readable {
    constructor({ url , headers , method , socket =null  }){
        super();
        // This is hardcoded for now, but can be updated to be configurable if needed.
        this.httpVersion = "1.0";
        this.httpVersionMajor = 1;
        this.httpVersionMinor = 0;
        // If we don't actually have a socket, we'll just use a mock one that
        // always returns false for the `encrypted` property.
        this.socket = new Proxy({}, {
            get: (_target, prop)=>{
                if (prop !== "encrypted") {
                    throw new Error("Method not implemented");
                }
                // For this mock request, always ensure we just respond with the encrypted
                // set to false to ensure there's no odd leakages.
                return false;
            }
        });
        this.url = url;
        this.headers = headers;
        this.method = method;
        if (socket) {
            this.socket = socket;
        }
    }
    _read() {
        this.emit("end");
        this.emit("close");
    }
    /**
   * The `connection` property is just an alias for the `socket` property.
   *
   * @deprecated — since v13.0.0 - Use socket instead.
   */ get connection() {
        return this.socket;
    }
    // The following methods are not implemented as they are not used in the
    // Next.js codebase.
    get aborted() {
        throw new Error("Method not implemented");
    }
    get complete() {
        throw new Error("Method not implemented");
    }
    get trailers() {
        throw new Error("Method not implemented");
    }
    get rawTrailers() {
        throw new Error("Method not implemented");
    }
    get rawHeaders() {
        throw new Error("Method not implemented.");
    }
    setTimeout() {
        throw new Error("Method not implemented.");
    }
}
export class MockedResponse extends Stream.Writable {
    constructor({ socket =null  }){
        super();
        this.statusCode = 200;
        this.statusMessage = "";
        this.finished = false;
        this.headersSent = false;
        /**
   * A list of buffers that have been written to the response.
   */ this.buffers = [];
        this.headers = new Headers();
        this.socket = socket;
        // Attach listeners for the `finish`, `end`, and `error` events to the
        // `MockedResponse` instance.
        this.hasStreamed = new Promise((resolve, reject)=>{
            this.on("finish", ()=>resolve(true));
            this.on("end", ()=>resolve(true));
            this.on("error", (err)=>reject(err));
        });
    }
    /**
   * The `connection` property is just an alias for the `socket` property.
   *
   * @deprecated — since v13.0.0 - Use socket instead.
   */ get connection() {
        return this.socket;
    }
    write(chunk) {
        this.buffers.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        return true;
    }
    /**
   * This method is a no-op because the `MockedResponse` instance is not
   * actually connected to a socket. This method is not specified on the
   * interface type for `ServerResponse` but is called by Node.js.
   *
   * @see https://github.com/nodejs/node/pull/7949
   */ _implicitHeader() {}
    _write(chunk, _encoding, callback) {
        this.write(chunk);
        // According to Node.js documentation, the callback MUST be invoked to
        // signal that the write completed successfully. If this callback is not
        // invoked, the 'finish' event will not be emitted.
        //
        // https://nodejs.org/docs/latest-v16.x/api/stream.html#writable_writechunk-encoding-callback
        callback();
    }
    writeHead(statusCode, statusMessage, headers) {
        if (!headers && typeof statusMessage !== "string") {
            headers = statusMessage;
        } else if (typeof statusMessage === "string" && statusMessage.length > 0) {
            this.statusMessage = statusMessage;
        }
        if (headers) {
            // When headers have been set with response.setHeader(), they will be
            // merged with any headers passed to response.writeHead(), with the
            // headers passed to response.writeHead() given precedence.
            //
            // https://nodejs.org/api/http.html#responsewriteheadstatuscode-statusmessage-headers
            //
            // For this reason, we need to only call `set` to ensure that this will
            // overwrite any existing headers.
            if (Array.isArray(headers)) {
                // headers may be an Array where the keys and values are in the same list.
                // It is not a list of tuples. So, the even-numbered offsets are key
                // values, and the odd-numbered offsets are the associated values. The
                // array is in the same format as request.rawHeaders.
                for(let i = 0; i < headers.length; i += 2){
                    // The header key is always a string according to the spec.
                    this.setHeader(headers[i], headers[i + 1]);
                }
            } else {
                for (const [key, value] of Object.entries(headers)){
                    // Skip undefined values
                    if (typeof value === "undefined") continue;
                    this.setHeader(key, value);
                }
            }
        }
        this.statusCode = statusCode;
        return this;
    }
    hasHeader(name) {
        return this.headers.has(name);
    }
    getHeader(name) {
        return this.headers.get(name) ?? undefined;
    }
    getHeaders() {
        return toNodeHeaders(this.headers);
    }
    getHeaderNames() {
        return Array.from(this.headers.keys());
    }
    setHeader(name, value) {
        if (Array.isArray(value)) {
            // Because `set` here should override any existing values, we need to
            // delete the existing values before setting the new ones via `append`.
            this.headers.delete(name);
            for (const v of value){
                this.headers.append(name, v);
            }
        } else if (typeof value === "number") {
            this.headers.set(name, value.toString());
        } else {
            this.headers.set(name, value);
        }
    }
    removeHeader(name) {
        this.headers.delete(name);
    }
    // The following methods are not implemented as they are not used in the
    // Next.js codebase.
    assignSocket() {
        throw new Error("Method not implemented.");
    }
    detachSocket() {
        throw new Error("Method not implemented.");
    }
    writeContinue() {
        throw new Error("Method not implemented.");
    }
    writeProcessing() {
        throw new Error("Method not implemented.");
    }
    get upgrading() {
        throw new Error("Method not implemented.");
    }
    get chunkedEncoding() {
        throw new Error("Method not implemented.");
    }
    get shouldKeepAlive() {
        throw new Error("Method not implemented.");
    }
    get useChunkedEncodingByDefault() {
        throw new Error("Method not implemented.");
    }
    get sendDate() {
        throw new Error("Method not implemented.");
    }
    setTimeout() {
        throw new Error("Method not implemented.");
    }
    addTrailers() {
        throw new Error("Method not implemented.");
    }
    flushHeaders() {
        throw new Error("Method not implemented.");
    }
}
export function createRequestResponseMocks({ url , headers ={} , method ="GET" , socket =null  }) {
    return {
        req: new MockedRequest({
            url,
            headers,
            method,
            socket
        }),
        res: new MockedResponse({
            socket
        })
    };
}

//# sourceMappingURL=mock-request.js.map