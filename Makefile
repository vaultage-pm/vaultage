# === Variables

PACKAGES=$(wildcard packages/*)
TASKS=build clean cleanall test
NODE_MODULES=node_modules/.makets


# === Default task
.PHONY: all
all:
	$(MAKE) build

# Ensures the app is built before it is tested
test: build

# === Dependencies (No circular dependencies are allowed here)

packages/vaultage: packages/vaultage-ui-webcli packages/vaultage-protocol
packages/vaultage-client: packages/vaultage-protocol
packages/vaultage-ui-webcli: packages/vaultage-client
packages/chrome-ext: packages/vaultage-client

# === Custom tasks

.PHONY: serve
serve:
	$(MAKE) build
	$(MAKE) -C packages/vaultage clean-storage
	$(MAKE) -C packages/vaultage serve

.PHONY: integration-test
integration-test:
	./tools/integration-test.sh

publish: $(NODE_MODULES)
	NODE_ENV=production node_modules/.bin/ts-node tools/publish.ts

publish-docker: $(NODE_MODULES)
	NODE_ENV=production node_modules/.bin/ts-node tools/publish-docker.ts

$(NODE_MODULES): package.json package-lock.json
	npm install
	touch $(NODE_MODULES)

# === Boilerplate

# Dispatches the tasks accross all packages

.PHONY: $(TASKS)
$(TASKS): $(PACKAGES)

.PHONY: $(PACKAGES)
$(PACKAGES):
	$(MAKE) -C $@ $(MAKECMDGOALS)
