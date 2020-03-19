SRC=$(shell find src/ -type f -name '*.ts')
VAULTAGE_CLIENT_LOCATION=../vaultage-client/dist/vaultage.js
IMPORTED_VAULTAGE_CLIENT_LOCATION=public/dist/vaultage.js

.PHONY: all $(IMPORTED_VAULTAGE_CLIENT_LOCATION) build serve clean cleanall test node_upgrade

all: serve

install: node_modules/built

# "built" is just there so Make sees the artifact and doesn't rebuild
node_modules/built: package.json package-lock.json
	npm install
	touch node_modules/built

build: install $(SRC) $(wildcard dist/messages/*.js) $(IMPORTED_VAULTAGE_CLIENT_LOCATION)
	npm run build

serve: build
	npm run serve

# Builds the "Vaultage Client" and copies the exported .js here, ready to be served
$(IMPORTED_VAULTAGE_CLIENT_LOCATION):
	$(MAKE) -C ../vaultage-client build
	mkdir -p public/dist
	cp $(VAULTAGE_CLIENT_LOCATION) public/dist

clean:
	rm -rf public/dist/

cleanall: clean
	rm -rf node_modules

test: build
	npm run lint

node_upgrade:
	ncu -u