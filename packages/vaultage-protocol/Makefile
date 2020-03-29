DIST_ROOT=dist/main.js
SRC=$(wildcard src/*.ts) $(wildcard src/messages/*.ts)

.PHONY: all build test clean cleanall node_upgrade

all: test

build: $(DIST_ROOT)

$(DIST_ROOT): $(SRC)
	npm run build

clean:
	rm -rf dist/

cleanall: clean
	rm -rf node_modules

test: build
	npm test

node_upgrade:
	ncu -u