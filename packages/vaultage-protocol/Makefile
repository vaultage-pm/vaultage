.PHONY: all build test clean cleanall node_upgrade

all: test

install: node_modules/built

# "built" is just there so Make sees the artifact and doesn't rebuild
node_modules/built: package.json package-lock.json
	npm install
	touch node_modules/built

build: install $(wildcard dist/*.js) $(wildcard dist/messages/*.js)
	npm run build

clean:
	rm -rf dist/

cleanall: clean
	rm -rf node_modules

test: build
	npm test

node_upgrade:
	ncu -u