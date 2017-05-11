Vaultage chrome extension
=========================

This package contains a chrome extension for the Vaultage password manager.

## Development

Requires nodejs and GNU make.

### Installing dependencies

`make`

### Building

`make`

### Testing

Go to `chrome://extensions`, make sure "developer mode" is enabled
and click on "load unpacked extension". 
Then select ~REPO_ROOT/packages/chrome-ext/**dist**

*Pro tip*: It is easier to debug the extension in its own window.
Locate the extension ID on the page `chrome://extensions` and then
navigate to `chrome-extension://_ID_/popup.html`

Everytime you change something, run `make` and refresh the page in chrome.
