BIN = dist/vaultage.js

WEBPACK_FLAGS = --output-library Vaultage

all: $(BIN) doc

$(BIN): node_modules vaultage.js
	node_modules/.bin/webpack $(WEBPACK_FLAGS) vaultage.js $(BIN)

doc: vaultage.js
	node_modules/.bin/jsdoc -d doc vaultage.js

clean:
	rm -r dist/ node_modules/ doc/

node_modules:
	npm install

.PHONY: clean