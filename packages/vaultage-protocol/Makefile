.PHONY: all build test clean cleanall node_upgrade

all: test

build: $(wildcard dist/*.js) $(wildcard dist/messages/*.js)
	npm run build

clean:
	rm -rf dist/

cleanall: clean
	rm -rf node_modules

test: build
	npm test

node_upgrade:
	ncu -u