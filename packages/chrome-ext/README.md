Vaultage extension for Google Chrome
====================================

/!\ This feature is highly experimental. It may not work.

## Overview

- Lets you fill a password field from the context menu, or with a keyboard shortcut.

## Usage

Open [chrome://extensions/](chrome://extensions/), click "load unpacked" and chose this folder.

On a login form, right click in the password field and chose "Fill with password...".  
Enter your credentials, and pick the password you need.

You can also use the keyboard shortcut `Ctrl+Shift+f` to open the dialog.

## Troubleshooting

### Auth basic

If you have basic auth in front of your server, make sure all responses have a correct 'Access-Control-Allow-Origin' header set, otherwise, the extension won't be able to recognize a basic auth wall.

If you are using nginx, add this to your configuration:

```
add_header Access-Control-Allow-Origin * always;
```

### The keyboard shortcut does not work

Open [chrome://extensions/](chrome://extensions/) and navigate to the "Keyboard shortcuts" using the menu. You can set the shortcut there.


### The password is incorrect

In some cases, the application does not detect when the Vaultage extension fills out the password field. In such case, when you submit the form, the application thinks the password field is empty.

To solve this problem, try typing and erasing a character after you've filled the password field with Vaultage. This may allow the application to re-capture the value in the password field.

## Building

Go to the top-level directory of the project and run `make build` to build the extension as well as the required dependencies.
