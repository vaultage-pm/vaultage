BIN=dist/src/main.js
SRC=$(shell find src/ -type f -name '*.ts')
DATA_DIR=.data
NODE_MODULES=node_modules/.makets

# Mandatory tasks (imposed by the top-level Makefile)

.PHONY: build
build: $(BIN)

.PHONY: clean
clean: $(NODE_MODULES)
	npm run clean

.PHONY: cleanall
cleanall: clean
	rm -rf node_modules

.PHONY: test
test: $(NODE_MODULES) build
	npm test

# Other tasks

$(BIN): $(NODE_MODULES) $(SRC)
	npm run build

$(NODE_MODULES): package.json package-lock.json
	npm install
	touch $(NODE_MODULES)

.PHONY: clean-storage
clean-storage:
	rm -rf $(DATA_DIR)/*

.PHONY: serve
serve: $(BIN)
	npm start -- -d $(DATA_DIR)
