import ext from "./utils/ext";
import storage from "./utils/storage";

chrome.browserAction.setBadgeBackgroundColor({color: "#999999"});
ext.browserAction.setBadgeText({text: ""});
ext.browserAction.setTitle({
    title: "No ducks"
});
ext.browserAction.disable();

ext.tabs.onActivated.addListener((info) => {
    setCountForTab(info.tabId);
    console.log(info, "tab change");
});
ext.tabs.query({active: true, currentWindow: true}, (tabs) => {
    setCountForTab(tabs[0].id);
});


ext.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "count-updated") {
        if (sender.tab.active) {
            // is current tab, so update count
            setCountForTab(sender.tab.id);
        }
    } else if (request.action === "count-from-iframe") {
        ext.webNavigation.getAllFrames({
            tabId: sender.tab.id
        }, (framesInfo) => {

            let allFrames = [];
            framesInfo.forEach((frmInfo) => {
                if (frmInfo.frameId > 0)
                    allFrames.push(frmInfo.frameId);
            });

            ext.tabs.sendMessage(sender.tab.id, {
                action: "count-from-iframe",
                data: request.data,
                frameId: sender.frameId,
                tabId: sender.tab.id,
                frameIds: allFrames
            }, {
                frameId: 0
            }, (res) => {
                if (res && res.success) {
                    // ok
                }
            });
        });
    } else if (request.action === "toggle-exclude") {

        storage.get("exclude", (resp) => {

            resp.exclude = resp.exclude || "";

            let excludedHosts = resp.exclude.split("\n");
            excludedHosts = excludedHosts.map((line) => {
                return line.trim();
            }).filter((line) => {
                return line.trim() !== "";
            });

            let index = excludedHosts.indexOf(request.data), isExcluded = false;
            if (index > -1) {
                excludedHosts.splice(index, 1);
            } else {
                excludedHosts.push(request.data);
                isExcluded = true;
            }

            storage.set({
                exclude: excludedHosts.join("\n")
            }, () => {

                console.log('sendResponse');

                sendResponse({
                    success: true,
                    isExcluded: isExcluded
                });

            });

        });

        return true;

    }
});


function setCountForTab(id) {
    ext.tabs.sendMessage(id, {action: "get-count"}, {
        frameId: 0
    }, (res) => {
        console.log(res);
        if (res && res.count >= 0) {

            ext.browserAction.setBadgeText({text: res.count + "" || ""});
            ext.browserAction.setTitle({
                title: res.count ? res.count + " ducks" : "No ducks"
            });
            ext.browserAction.enable();

        } else {

            ext.browserAction.setBadgeText({text: ""});
            ext.browserAction.setTitle({
                title: "What The Duck"
            });
            ext.browserAction.disable();

        }
    })
}