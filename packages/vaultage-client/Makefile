WEBPACK_FLAGS = --output-library Vaultage

.PHONY: all build clean cleanall test integration-test node_upgrade

all: test build

build: webpack.config.js $(wildcard dist/*.js) $(wildcard lib/*.js)
	npm run build

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
