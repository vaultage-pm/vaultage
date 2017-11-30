# === Variables

PACKAGES=$(wildcard packages/*)
TASKS=build clean cleanall test


# === Default task
.PHONY: all
all:
	$(MAKE) build


# === Dependencies

packages/vaultage: packages/vaultage-ui-webcli
packages/vaultage-ui-webcli: packages/vaultage-client


# === Custom tasks

.PHONY: serve
serve:
	$(MAKE) build
	$(MAKE) -C packages/vaultage serve

.PHONY: integration-test
integration-test:
	./tools/integration-test.sh

publish: node_modules
	$(MAKE) test
	$(MAKE) clean
	$(MAKE) build
	node_modules/.bin/ts-node tools/publish.ts

node_modules: package.json package-lock.json
	npm install

# === Boilerplate

# Dispatches the tasks accross all packages

.PHONY: $(TASKS)
$(TASKS): $(PACKAGES)

.PHONY: $(PACKAGES)
$(PACKAGES):
	$(MAKE) -C $@ $(MAKECMDGOALS)
