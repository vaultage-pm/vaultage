BIN=dist/main.js
SRC=$(shell find src/ -type f -name '*.ts')

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
test: node_modules $(BIN)
	npm test

# Other tasks

$(BIN): node_modules $(SRC)
	npm run build

node_modules: package.json package-lock.json
	npm install
