SRC=$(shell find src/ -type f -name '*.ts')
BIN=public/dist/main.js

# Mandatory tasks (imposed by the top-level Makefile)

.PHONY: build
build: $(BIN) copy-vaultage-client

.PHONY: clean
clean:
	rm -rf dist/ tmp/

.PHONY: cleanall
cleanall: clean
	rm -rf node_modules

.PHONY: test
test: node_modules
	echo "No tests for now"


# Other tasks

.PHONY: copy-vaultage-client
copy-vaultage-client: node_modules
	npm run copy-vaultage-client

$(BIN): $(SRC) node_modules
	npm run build

.PHONY: serve
serve: build
	npm run serve

node_modules: package.json package-lock.json
	npm install
