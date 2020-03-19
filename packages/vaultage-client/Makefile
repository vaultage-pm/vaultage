WEBPACK_FLAGS = --output-library Vaultage

.PHONY: all build clean cleanall test integration-test node_upgrade

all: test build

install: node_modules/built

# "built" is just there so Make sees the artifact and doesn't rebuild
node_modules/built: package.json package-lock.json
	npm install
	touch node_modules/built

build: install webpack.config.js $(wildcard dist/*.js) $(wildcard lib/*.js)
	npm run build

clean:
	rm -rf dist/ tmp/ integration-test/tmp

cleanall: clean
	rm -rf node_modules

test: build
	npm test

<<<<<<< HEAD
# Other tasks

$(BIN): $(NODE_MODULES) $(SRC) webpack.config.js $(wildcard lib/*.js) tsconfig.json
	npm run build

$(NODE_MODULES): package.json package-lock.json
	npm install
	touch $(NODE_MODULES)

.PHONY: integration-test
integration-test: $(NODE_MODULES)
	node_modules/.bin/ts-node --project integration-test/tsconfig.json $(IT)
=======
integration-test:
	node_modules/.bin/ts-node test/integration_test.ts

node_upgrade:
	ncu -u
>>>>>>> master
