<img src="./resources/what-the-duck.png"/>

# What The Duck
A simple browser extension which replaces the F word with "duck".  

## Features
- Replaces the F word with "duck" 
- Allows you to exclude specific sites
- Shows the count of ducks in browser toolbar

## Browser support
- Chrome
- Firefox
- Opera
- *any browser which supports WebExtensions API*

## Install
- Chrome: [Chrome Webstore](https://chrome.google.com/webstore/detail/what-the-duck/akcgddilpnbanfbhndpkfcfaemahiacg)
- Firefox: [Mozilla Add-ons](https://addons.mozilla.org/en-US/firefox/addon/what-the-duck/)
- Opera: [Opera Add-ons](https://addons.opera.com/en/extensions/details/what-the-duck/)

Alternately, if you want to install the extension directly, here are the download links. After downloading it, unzip the file and load it in your browser using the steps mentioned below.
 - [**Download Chrome Extension**](https://github.com/usamaejaz/what-the-duck/releases/download/v1.0/chrome.zip)
 - [**Download Opera Extension**](https://github.com/usamaejaz/what-the-duck/releases/download/v1.0/opera.zip)
 - [**Download Firefox Extension**](https://github.com/usamaejaz/what-the-duck/releases/download/v1.0/firefox.zip)


##### Load the extension in Chrome & Opera
1. Open Chrome/Opera browser and navigate to chrome://extensions
2. Select "Developer Mode" and then click "Load unpacked extension..."
3. From the file browser, choose the folder containing extension package


##### Load the extension in Firefox
1. Open Firefox browser and navigate to about:debugging
2. Click "Load Temporary Add-on" and from the file browser, choose the folder containing extension package


## Developing
The extension uses the [extension boilerplate template](https://github.com/EmailThis/extension-boilerplate) by @EmailThis.
The following tasks can be used when you want to start developing the extension and want to enable live reload. 

- `npm run chrome-watch`
- `npm run opera-watch`
- `npm run firefox-watch`


## Packaging
Run `npm run dist` to create a zipped, production-ready extension for each browser.


## TODO
- Quack
- Quack
- Quack


-----------

If you have any questions or comments, please create a new issue. I'd be happy to hear your thoughts.

[Usama Ejaz](https://usamaejaz.com)
