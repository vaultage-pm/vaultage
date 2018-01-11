BIN=dist/vaultage.js
SRC=$(wildcard src/*.ts)
TESTS=$(wildcard test/*.ts)
IT=integration-test/integration-test.ts

WEBPACK_FLAGS = --output-library Vaultage

.PHONY: all
all: test build


# Mandatory tasks (imposed by the top-level Makefile)

.PHONY: build
build: $(BIN)

.PHONY: clean
clean:
	rm -rf dist/ tmp/ integration-test/tmp

.PHONY: cleanall
cleanall: clean
	rm -rf node_modules

.PHONY: test
test: node_modules $(SRC) $(TESTS)
	npm test

# Other tasks

$(BIN): node_modules $(SRC)
	npm run build

node_modules: package.json package-lock.json
	npm install

.PHONY: integration-test
integration-test: node_modules
	node_modules/.bin/ts-node $(IT)
