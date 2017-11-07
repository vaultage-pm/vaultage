BIN=dist/main.js
SRC=$(shell find src/ -type f -name '*.ts')

# Mandatory tasks (imposed by the top-level Makefile)

.PHONY: build
build: $(BIN)

.PHONY: clean
clean: node_modules
	npm run clean

.PHONY: cleanall
cleanall: clean
	rm -rf node_modules

# Other tasks

$(BIN): node_modules $(SRC)
	npm run build

node_modules: package.json package-lock.json
	npm install

.PHONY: serve
serve: $(BIN)
	npm start