.PHONY: all build test clean cleanall node_upgrade

all: test

install: package.json package-lock.json
	npm install

build: install
	npm run build

clean:
	rm -rf dist/

cleanall: clean
	rm -rf node_modules

test: build
	npm test

node_upgrade:
	ncu -u