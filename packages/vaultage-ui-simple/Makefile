.PHONY: all
all: node_modules serve


# Mandatory tasks (imposed by the top-level Makefile)

.PHONY: build
build: copy-vaultage-client

.PHONY: clean
clean:
	rm -f public/dist/vaultage.js

.PHONY: cleanall
cleanall: clean
	rm -rf node_modules


# Other tasks

.PHONY: copy-vaultage-client
copy-vaultage-client: node_modules
	npm run copy-vaultage-client

.PHONY: serve
serve: node_modules copy-vaultage-client
	npm run serve

node_modules: package.json package-lock.json
	npm install
