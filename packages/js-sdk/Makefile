BIN = dist/vaultage.js

WEBPACK_FLAGS = --output-library Vaultage

all: $(BIN)

$(BIN): node_modules vaultage.ts
	node_modules/.bin/webpack

clean:
	rm -rf dist/ node_modules/

node_modules:
	npm install

tsc:
	node_modules/.bin/tsc -p .

run_demo:
	node demo.js

demo: all tsc run_demo

.PHONY: clean tsc