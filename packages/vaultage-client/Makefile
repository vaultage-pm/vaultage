WEBPACK_FLAGS = --output-library Vaultage

.PHONY: all build clean cleanall test integration-test node_upgrade

all: test build

install: package.json package-lock.json
	npm install

build: install webpack.config.js $(wildcard lib/*.js)
	npm run build

clean:
	rm -rf dist/ tmp/ integration-test/tmp

cleanall: clean
	rm -rf node_modules

test: build
	npm test
	$(MAKE) integration-test

node_upgrade:
	ncu -u