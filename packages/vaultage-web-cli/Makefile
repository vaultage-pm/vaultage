.PHONY: all
all: node_modules
	npm run build

.PHONY: clean
clean:
	rm -rf dist/ tmp/

.PHONY: mrproper
mrproper: clean
	rm -rf node_modules

node_modules:
	npm install