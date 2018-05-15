BIN=dist/main.js
SRC=$(shell find src/ -type f -name '*.ts')
NODE_MODULES=node_modules/.makets

.PHONY: all
all: test build


# Mandatory tasks (imposed by the top-level Makefile)

.PHONY: build
build: $(BIN)

.PHONY: clean
clean:
	rm -rf dist/

.PHONY: cleanall
cleanall: clean
	rm -rf node_modules

.PHONY: test
test: $(NODE_MODULES) $(BIN)
	npm test

# Other tasks

$(BIN): $(NODE_MODULES) $(SRC)
	npm run build

$(NODE_MODULES): package.json package-lock.json
	npm install
	touch $(NODE_MODULES)
