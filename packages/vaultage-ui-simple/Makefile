.PHONY: all
all: node_modules serve

.PHONY: build
build: copy-vaultage-client

.PHONY: copy-vaultage-client
copy-vaultage-client:
	npm run copy-vaultage-client

.PHONY: serve
serve: node_modules copy-vaultage-client
	npm run serve

node_modules:
	npm install

.PHONY: clean
clean:
	rm -f public/dist/vaultage.js

.PHONY: cleanall
cleanall: clean
	rm -rf node_modules