DATA_DIR=.data

# Mandatory tasks (imposed by the top-level Makefile)

.PHONY: all build clean cleanall test clean-storage serve node_upgrade

all: test

install: package.json package-lock.json
	npm install

build: install
	npm run build

clean:
	npm run clean

cleanall: clean clean-storage
	rm -rf node_modules

test: build
	npm test

clean-storage:
	rm -rf $(DATA_DIR)/*

serve: build
	npm start -- -d $(DATA_DIR)

node_upgrade:
	ncu -u