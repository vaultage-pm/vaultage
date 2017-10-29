BIN=dist/vaultage.js
INDEX=vaultage.ts
SRC=$(wildcard src/*.ts)
TESTS=$(wildcard test/*.ts)
DEMO=demo/demo.ts
DEMO_BIN=demo/tmp/demo.js

WEBPACK_FLAGS = --output-library Vaultage

.PHONY: all
all: test $(BIN) demo

$(BIN): node_modules $(INDEX)
	node_modules/.bin/webpack

.PHONY: clean
clean:
	rm -rf dist/ tmp/

.PHONY: mrproper
mrproper: clean
	rm -rf node_modules

node_modules:
	npm install

.PHONY: tsc
tsc:
	node_modules/.bin/tsc -p .

.PHONY: test
test: $(DEMO) $(SRC) $(TESTS)
	npm test

$(INDEX): $(SRC)
	rm -f $(INDEX)
	for i in $(subst .ts, , $(SRC)); do echo export \* from \"./$$i\" >> $(INDEX); done

$(DEMO_BIN): $(DEMO) $(SRC) node_modules
	node node_modules/.bin/tsc --outDir demo/tmp $(DEMO)
	mkdir -p demo/tmp/lib
	cp lib/sjcl.js demo/tmp/lib/

.PHONY: demo
demo: $(DEMO_BIN) $(INDEX)
	node $(DEMO_BIN)
