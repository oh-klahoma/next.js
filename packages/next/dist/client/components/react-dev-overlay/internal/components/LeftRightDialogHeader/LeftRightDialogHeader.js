"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LeftRightDialogHeader", {
    enumerable: true,
    get: function() {
        return LeftRightDialogHeader;
    }
});
const _interop_require_wildcard = require("@swc/helpers/_/_interop_require_wildcard");
const _react = /*#__PURE__*/ _interop_require_wildcard._(require("react"));
const _CloseIcon = require("../../icons/CloseIcon");
const LeftRightDialogHeader = function LeftRightDialogHeader(param) {
    let { children , className , previous , next , close  } = param;
    const buttonLeft = _react.useRef(null);
    const buttonRight = _react.useRef(null);
    const buttonClose = _react.useRef(null);
    const [nav, setNav] = _react.useState(null);
    const onNav = _react.useCallback((el)=>{
        setNav(el);
    }, []);
    _react.useEffect(()=>{
        if (nav == null) {
            return;
        }
        const root = nav.getRootNode();
        const d = self.document;
        function handler(e) {
            if (e.key === "ArrowLeft") {
                e.stopPropagation();
                if (buttonLeft.current) {
                    buttonLeft.current.focus();
                }
                previous && previous();
            } else if (e.key === "ArrowRight") {
                e.stopPropagation();
                if (buttonRight.current) {
                    buttonRight.current.focus();
                }
                next && next();
            } else if (e.key === "Escape") {
                e.stopPropagation();
                if (root instanceof ShadowRoot) {
                    const a = root.activeElement;
                    if (a && a !== buttonClose.current && a instanceof HTMLElement) {
                        a.blur();
                        return;
                    }
                }
                if (close) {
                    close();
                }
            }
        }
        root.addEventListener("keydown", handler);
        if (root !== d) {
            d.addEventListener("keydown", handler);
        }
        return function() {
            root.removeEventListener("keydown", handler);
            if (root !== d) {
                d.removeEventListener("keydown", handler);
            }
        };
    }, [
        close,
        nav,
        next,
        previous
    ]);
    // Unlock focus for browsers like Firefox, that break all user focus if the
    // currently focused item becomes disabled.
    _react.useEffect(()=>{
        if (nav == null) {
            return;
        }
        const root = nav.getRootNode();
        // Always true, but we do this for TypeScript:
        if (root instanceof ShadowRoot) {
            const a = root.activeElement;
            if (previous == null) {
                if (buttonLeft.current && a === buttonLeft.current) {
                    buttonLeft.current.blur();
                }
            } else if (next == null) {
                if (buttonRight.current && a === buttonRight.current) {
                    buttonRight.current.blur();
                }
            }
        }
    }, [
        nav,
        next,
        previous
    ]);
    return /*#__PURE__*/ _react.createElement("div", {
        "data-nextjs-dialog-left-right": true,
        className: className
    }, /*#__PURE__*/ _react.createElement("nav", {
        ref: onNav
    }, /*#__PURE__*/ _react.createElement("button", {
        ref: buttonLeft,
        type: "button",
        disabled: previous == null ? true : undefined,
        "aria-disabled": previous == null ? true : undefined,
        onClick: previous != null ? previous : undefined
    }, /*#__PURE__*/ _react.createElement("svg", {
        viewBox: "0 0 14 14",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg"
    }, /*#__PURE__*/ _react.createElement("path", {
        d: "M6.99996 1.16666L1.16663 6.99999L6.99996 12.8333M12.8333 6.99999H1.99996H12.8333Z",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
    }))), /*#__PURE__*/ _react.createElement("button", {
        ref: buttonRight,
        type: "button",
        disabled: next == null ? true : undefined,
        "aria-disabled": next == null ? true : undefined,
        onClick: next != null ? next : undefined
    }, /*#__PURE__*/ _react.createElement("svg", {
        viewBox: "0 0 14 14",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg"
    }, /*#__PURE__*/ _react.createElement("path", {
        d: "M6.99996 1.16666L12.8333 6.99999L6.99996 12.8333M1.16663 6.99999H12H1.16663Z",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
    }))), "\xa0", children), close ? /*#__PURE__*/ _react.createElement("button", {
        "data-nextjs-errors-dialog-left-right-close-button": true,
        ref: buttonClose,
        type: "button",
        onClick: close,
        "aria-label": "Close"
    }, /*#__PURE__*/ _react.createElement("span", {
        "aria-hidden": "true"
    }, /*#__PURE__*/ _react.createElement(_CloseIcon.CloseIcon, null))) : null);
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=LeftRightDialogHeader.js.map