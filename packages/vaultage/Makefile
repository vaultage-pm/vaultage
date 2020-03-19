DATA_DIR=.data

.PHONY: all build clean cleanall test clean-storage serve node_upgrade integration-test

all: test

install: node_modules/built

# "built" is just there so Make sees the artifact and doesn't rebuild
node_modules/built: package.json package-lock.json
	npm install
	touch node_modules/built

build: install
	npm run build

clean: 
	rm -rf dist

clean-storage:
	rm -rf $(DATA_DIR)/*

cleanall: clean clean-storage
	rm -rf node_modules

test: build
	npm test

serve: build
	npm start -- -d $(DATA_DIR)

node_upgrade:
	ncu -u