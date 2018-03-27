BIN=dist/src/main.js
SRC=$(shell find src/ -type f -name '*.ts')
DATA_DIR=.data

# Mandatory tasks (imposed by the top-level Makefile)

.PHONY: build
build: $(BIN)

.PHONY: clean
clean: node_modules
	npm run clean

.PHONY: cleanall
cleanall: clean
	rm -rf node_modules

.PHONY: test
test: node_modules
	npm test

# Other tasks

$(BIN): node_modules $(SRC)
	npm run build

node_modules: package.json package-lock.json
	npm install

.PHONY: clean-storage
clean-storage:
	rm -rf $(DATA_DIR)

.PHONY: serve
serve: $(BIN)
	npm start -- -d $(DATA_DIR)
