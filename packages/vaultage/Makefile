DATA_DIR=.data

.PHONY: all build clean cleanall test clean-storage serve node_upgrade integration-test

all: test

build:
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