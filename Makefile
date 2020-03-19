.PHONY: all serve publish publish-docker clean cleanall build test node_upgrade install

all: build

serve: build install
	$(MAKE) -C packages/vaultage clean-storage
	$(MAKE) -C packages/vaultage serve

clean: 
	$(MAKE) -C packages/vaultage-protocol clean
	$(MAKE) -C packages/vaultage-client clean
	$(MAKE) -C packages/vaultage-ui-webcli clean
	$(MAKE) -C packages/vaultage clean

cleanall: 
	$(MAKE) -C packages/vaultage-protocol cleanall
	$(MAKE) -C packages/vaultage-client cleanall
	$(MAKE) -C packages/vaultage-ui-webcli cleanall
	$(MAKE) -C packages/vaultage cleanall
	rm -rf node_modules

build: install
	$(MAKE) -C packages/vaultage-protocol build
	$(MAKE) -C packages/vaultage-client build
	$(MAKE) -C packages/vaultage-ui-webcli build
	$(MAKE) -C packages/vaultage build

test: build
	$(MAKE) -C packages/vaultage-protocol test
	$(MAKE) -C packages/vaultage-client test
	$(MAKE) -C packages/vaultage-ui-webcli test
	$(MAKE) -C packages/vaultage test

integration-test:
	./tools/integration-test.sh

install: node_modules/built

# "built" is just there so Make sees the artifact and doesn't rebuild
node_modules/built: package.json yarn.lock
	yarn
	touch node_modules/built

publish: install
	node_modules/.bin/ts-node tools/publish.ts

publish-docker: install
	node_modules/.bin/ts-node tools/publish-docker.ts

# === Node package upgrade (make sure everything is comitted, overwrites package-lock.json)
# Requires NCU (https://github.com/tjunnone/npm-check-updates)
node_upgrade:
	$(MAKE) -C packages/vaultage node_upgrade
	$(MAKE) -C packages/vaultage-client node_upgrade
	$(MAKE) -C packages/vaultage-protocol node_upgrade
	$(MAKE) -C packages/vaultage-ui-webcli node_upgrade
	ncu -u