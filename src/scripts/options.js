import storage from "./utils/storage";

let excludeTextArea = document.getElementById("exclude");

let saveTimer;

storage.get("exclude", (resp) => {

    resp.exclude = resp.exclude || "";

    excludeTextArea.value = resp.exclude;

    excludeTextArea.focus();

    excludeTextArea.addEventListener("input", function () {
        if (saveTimer) {
            clearTimeout(saveTimer);
        }
        saveTimer = setTimeout(() => {

            storage.set({
                exclude: excludeTextArea.value.trim().split("\n").filter((line) => {
                    return line.trim() !== "";
                }).join("\n")
            });

            saveTimer = null;

        }, 200);
    });

});
