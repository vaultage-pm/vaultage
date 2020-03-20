SRC=$(shell find src/ -type f -name '*.ts')
.PHONY: all $(IMPORTED_VAULTAGE_CLIENT_LOCATION) build serve clean cleanall test node_upgrade

all: serve

build: $(SRC) $(wildcard dist/messages/*.js) $(IMPORTED_VAULTAGE_CLIENT_LOCATION)
	npm run build

serve: build
	npm run serve

clean:
	rm -rf public/dist/

cleanall: clean
	rm -rf node_modules

test: build
	npm run lint

node_upgrade:
	ncu -u