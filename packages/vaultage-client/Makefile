WEBPACK_FLAGS = --output-library Vaultage

BIN=dist/vaultage.js

.PHONY: all build clean cleanall test integration-test node_upgrade

all: test build

build: $(BIN)

$(BIN): webpack.config.js $(wildcard src/*.ts) $(wildcard src/*/*.ts) $(wildcard lib/*.js)
	npm run build
	npm run build:api

clean:
	rm -rf dist/ tmp/ integration-test/tmp

cleanall: clean
	rm -rf node_modules

test: build
	npm test


# Other tasks

integration-test:
	node_modules/.bin/ts-node -P integration-test/tsconfig.json integration-test/integration_test.ts

node_upgrade:
	ncu -u
