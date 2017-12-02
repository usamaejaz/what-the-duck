import ext from "./utils/ext";
import storage from "./utils/storage";

let displayContainer = document.getElementById("display-container");

let template = (data, isExcluded) => {
    return (`
        <h3 class="title">${data}</h3>
        <div class="action-container">
            <button data-hostname="${data}" id="toggle-exclude-btn" class="btn btn-primary">${isExcluded ? "Enable" : "Disable"}</button>
        </div>
    `);
};
let renderMessage = (message) => {
    displayContainer.innerHTML = `<p class='message'>${message}</p>`;
};

let renderButton = (data, isExcluded) => {
    if (data) {
        displayContainer.innerHTML = template(data, isExcluded);
    } else {
        renderMessage("Sorry, could not extract this page's URL")
    }
};

ext.tabs.query({active: true, currentWindow: true}, function (tabs) {
    let activeTab = tabs[0];
    let _a = document.createElement("a");
    _a.href = activeTab.url;

    storage.get("exclude", (resp) => {

        resp.exclude = resp.exclude || "";

        let excludedHosts = resp.exclude.split("\n");
        excludedHosts = excludedHosts.map((line) => {
            return line.trim();
        });

        renderButton(_a.hostname || "", excludedHosts.indexOf(_a.hostname) > -1);

    });
});

document.addEventListener("click", function (e) {
    if (e.target && e.target.matches("#toggle-exclude-btn")) {
        e.preventDefault();
        let data = e.target.getAttribute("data-hostname");
        ext.runtime.sendMessage({action: "toggle-exclude", data: data}, (res) => {
            if (res && res.success) {
                renderMessage("Refresh the page for the changes to take effect.");
                setTimeout(() => {
                    renderButton(data, res.isExcluded);
                }, 3000);
            } else {
                renderMessage("Sorry, there was an error while saving.");
            }
        })
    }
});

let optionsLink = document.querySelector(".js-options");
optionsLink.addEventListener("click", function (e) {
    e.preventDefault();
    ext.tabs.create({'url': ext.extension.getURL('options.html')});
});
