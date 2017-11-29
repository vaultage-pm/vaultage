BIN=dist/vaultage.js
INDEX=vaultage.ts
SRC=$(wildcard src/*.ts)
TESTS=$(wildcard test/*.ts)
DEMO=demo/demo.ts
DEMO_BIN=demo/tmp/demo/demo.js
IT=integration-test/integration-test.ts
IT_BIN=integration-test/tmp/integration-test/integration-test.js

WEBPACK_FLAGS = --output-library Vaultage

.PHONY: all
all: test $(BIN) demo


# Mandatory tasks (imposed by the top-level Makefile)

.PHONY: build
build: $(BIN)

.PHONY: clean
clean:
	rm -rf dist/ tmp/ demo/tmp integration-test/tmp

.PHONY: cleanall
cleanall: clean
	rm -rf node_modules

.PHONY: test
test: node_modules $(DEMO) $(SRC) $(TESTS)
	npm test

# Other tasks

$(BIN): node_modules $(INDEX) $(SRC)
	npm run build

node_modules: package.json package-lock.json
	npm install

$(INDEX): $(SRC)
	rm -f $(INDEX)
	for i in $(subst .ts, , $(SRC)); do echo export \* from \'./$$i\' >> $(INDEX); done

$(DEMO_BIN): $(DEMO) $(SRC) node_modules
	node node_modules/.bin/tsc --outDir demo/tmp $(DEMO)
	mkdir -p demo/tmp/lib
	cp lib/sjcl.js demo/tmp/lib/

.PHONY: demo
demo: $(DEMO_BIN) $(INDEX)
	node $(DEMO_BIN)

$(IT_BIN): $(IT) $(SRC) node_modules
	node node_modules/.bin/tsc --outDir integration-test/tmp $(IT)
	mkdir -p integration-test/tmp/lib
	cp lib/sjcl.js integration-test/tmp/lib/

.PHONY: demo
integration-test: $(IT_BIN) $(INDEX)
	node $(IT_BIN)
