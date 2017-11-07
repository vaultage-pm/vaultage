.PHONY: all
all: node_modules build

.PHONY: clean
clean:
	rm -rf dist/ tmp/

.PHONY: cleanall
cleanall: clean
	rm -rf node_modules

.PHONY: copy-vaultage-client
copy-vaultage-client:
	npm run copy-vaultage-client

.PHONY: copy-vaultage-client
build: clean copy-vaultage-client
	npm run build

.PHONY: serve
serve: build
	npm run serve

node_modules:
	npm install