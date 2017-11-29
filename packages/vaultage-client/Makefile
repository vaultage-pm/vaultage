BIN=dist/vaultage.js
INDEX=vaultage.ts
SRC=$(wildcard src/*.ts)
TESTS=$(wildcard test/*.ts)
IT=integration-test/integration-test.ts
IT_BIN=integration-test/tmp/integration-test/integration-test.js

WEBPACK_FLAGS = --output-library Vaultage

.PHONY: all
all: test $(BIN)


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

$(BIN): node_modules $(INDEX) $(SRC)
	npm run build

node_modules: package.json package-lock.json
	npm install

$(INDEX): $(SRC)
	rm -f $(INDEX)
	for i in $(subst .ts, , $(SRC)); do echo export \* from \'./$$i\' >> $(INDEX); done

$(IT_BIN): $(IT) $(SRC) node_modules
	node node_modules/.bin/tsc --outDir integration-test/tmp $(IT)
	mkdir -p integration-test/tmp/lib
	cp lib/sjcl.js integration-test/tmp/lib/

.PHONY: integration-test
integration-test: $(IT_BIN) $(INDEX)
	node $(IT_BIN)
