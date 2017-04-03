BIN = dist/vaultage.js

WEBPACK_FLAGS = --output-library Vaultage

all: $(BIN)

$(BIN): node_modules vaultage.ts
	node_modules/.bin/webpack

clean:
	rm -r dist/ node_modules/

node_modules:
	npm install

.PHONY: clean