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
	make -C packages/vaultage serve

integration-test:
	make -C packages/vaultage-client integration-test


# === Boilerplate

# Dispatches the tasks accross all packages

.PHONY: $(TASKS)
$(TASKS): $(PACKAGES)

.PHONY: $(PACKAGES)
$(PACKAGES):
	$(MAKE) -C $@ $(MAKECMDGOALS)
