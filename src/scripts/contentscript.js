import ext from "./utils/ext";
import storage from "./utils/storage";

const ELEMENT = 1, DOCUMENT = 9, DOCUMENT_FRAGMENT = 11, TEXT = 3;

// Enter things that you'd like to replace
const MATCH = ['fuck'];
const REPLACE = ['duck'];

let replaces = 0;

let frameReplaces = {};

function walk(node) {
    // Function from here for replacing text: http://is.gd/mwZp7E

    if (!isOK(node)) return;

    let child, next;

    switch (node.nodeType) {
        case ELEMENT:  // Element
        case DOCUMENT:  // Document
        case DOCUMENT_FRAGMENT: // Document fragment
            child = node.firstChild;
            while (child) {
                next = child.nextSibling;
                walk(child);
                child = next;
            }
            break;

        case TEXT: // Text node
            replaceText(node);
            break;
    }
}

function debounce(func, wait, immediate) {
    let timeout;
    return function () {
        let context = this, args = arguments;
        let later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

let informCountUpdate = debounce(() => {
    if (window !== window.top) {
        ext.runtime.sendMessage({action: "count-from-iframe", data: replaces}, (res) => {
            if (res && res.success) {
                // ok
            }
        });
    } else {
        ext.runtime.sendMessage({action: "count-updated", data: replaces}, (response) => {
            if (response && response.success) {
                // ok
            }
        });
    }
}, 200);

function matchCase(text, pattern) {
    let result = '';

    for (let i = 0; i < text.length; i++) {
        let c = text.charAt(i);
        let p = pattern.charCodeAt(i);

        if (p >= 65 && p < 65 + 26) {
            result += c.toUpperCase();
        } else {
            result += c.toLowerCase();
        }
    }

    return result;
}

function isOK(domObj) {
    if (!domObj) return false;
    if (domObj &&
        (
            domObj.nodeName === "SCRIPT" || // no script tags
            domObj.nodeName === "NOSCRIPT" || // no noscript tags
            domObj.nodeName === "STYLE" || // no style tags
            domObj.isContentEditable || // no editable content
            /CodeMirror-line/.test(domObj.className || "") // duck codemirror
        )
    ) return false;
    if ((domObj.nodeType !== 1) || (domObj === document.body)) {
        return true;
    }
    if (domObj.currentStyle && domObj.currentStyle["display"] !== "none" && domObj.currentStyle["visibility"] !== "hidden") {
        return isOK(domObj.parentNode);
    } else if (window.getComputedStyle) {
        let cs = document.defaultView.getComputedStyle(domObj, null);
        if (cs.getPropertyValue("display") !== "none" && cs.getPropertyValue("visibility") !== "hidden") {
            return isOK(domObj.parentNode);
        }
    }
    return false;
}

function replaceText(textNode) {

    let v = textNode.nodeValue, _count = 0;

    // Go through and match/replace all the strings we've given it, using RegExp.
    for (let i = 0; i < MATCH.length; i++) {
        let re = new RegExp(MATCH[i], 'gi');
        let origFound = false;
        //v = v.replace(new RegExp('\\b' + MATCH[i] + '\\b', 'g'), REPLACE[i]);
        v = v.replace(re, function (match) {
            _count++;
            origFound = true;
            return matchCase(REPLACE[i], match);
        });
        if (!origFound) { // just for fixing count
            let matches = v.match(new RegExp(REPLACE[i], 'gi'));
            if (matches && matches.length)
                _count += matches.length;
        }
    }

    if (_count) {
        replaces += _count;
    }
    informCountUpdate();

    textNode.nodeValue = v;
}

let walkDebounced = debounce(() => {
    replaces = 0;
    walk(document.body);
    // frame replaces
    Object.keys(frameReplaces).forEach((key) => {
        if (frameReplaces[key])
            replaces += frameReplaces[key];
    });
    informCountUpdate();
}, 500);

storage.get("exclude", (resp) => {

    resp.exclude = resp.exclude || "";

    let excludedHosts = resp.exclude.split("\n");
    excludedHosts = excludedHosts.map((line) => {
        return line.trim();
    }).filter((line) => {
        return line.trim() !== "";
    });

    init(excludedHosts);

});

function init(excludedHosts) {

    let _hostname = document.location.hostname;
    if (window !== window.top) {
        try {
            _hostname = window.top.location.hostname;
        } catch (e) {
        }
    }

    informCountUpdate();

    if (excludedHosts.indexOf(_hostname) === -1) {

        walk(document.body);

        // Create a MutationObserver to handle events
        // (e.g. filtering TextNode elements)
        let observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes) {
                    walkDebounced();
                    /*
                    [].slice.call(mutation.addedNodes).forEach((node)=>{
                        walk(node);
                    });
                    */
                }
            });
        });

        // Start observing "childList" events in document and its descendants
        observer.observe(document, {
            childList: true,
            subtree: true
        });

        ext.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (!request || !request.action) return;
            if (request.action === "count-from-iframe") {
                let frameId = request.frameId;
                frameReplaces[frameId] = frameReplaces[frameId] || 0;
                if (frameReplaces[frameId] > 0) {
                    replaces -= frameReplaces[frameId];
                }

                frameReplaces[frameId] = request.data;
                replaces += request.data;

                // check frames
                Object.keys(frameReplaces).forEach((sFrmId) => {
                    let frmId = Number(sFrmId);
                    if (frameReplaces[frmId] && request.frameIds.indexOf(frmId) === -1) {
                        // remove replaces from this frame
                        replaces -= frameReplaces[frmId];
                        delete frameReplaces[frmId];
                    }
                });

                informCountUpdate();

                sendResponse({success: true});
            } else if (request.action === "get-count") {
                sendResponse({success: true, count: replaces});
            }
        });
    }
}