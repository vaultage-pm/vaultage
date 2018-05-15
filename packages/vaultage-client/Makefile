BIN =dist/vaultage.js
SRC =$(shell find src/ -type f -name '*.ts')
SRC +=$(shell find test/ -type f -name '*.ts')
IT =integration-test/integration-test.ts
NODE_MODULES=node_modules/.makets

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
test: $(NODE_MODULES) $(SRC) $(TESTS)
	npm test

# Other tasks

$(BIN): $(NODE_MODULES) $(SRC)
	npm run build

$(NODE_MODULES): package.json package-lock.json
	npm install
	touch $(NODE_MODULES)

.PHONY: integration-test
integration-test: $(NODE_MODULES)
	node_modules/.bin/ts-node $(IT)
