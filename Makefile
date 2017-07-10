PKG_DIR=packages
PACKAGES=js-sdk web-cli chrome-ext mobile-cli

BUILDPKGS = $(addprefix $(PKG_DIR)/, $(PACKAGES))
CLEANPKGS = $(PACKAGES:%=clean-%)

all: $(BUILDPKGS) dist-cli

$(BUILDPKGS):
	$(MAKE) -C $@

$(CLEANPKGS):
	$(MAKE) -C $(addprefix $(PKG_DIR)/, $(@:clean-%=%)) clean

dist-cli: clean-public
	cp -r packages/server public/
	cp -r packages/web-cli public/
	cp -r packages/mobile-cli public/

clean: clean-public $(CLEANPKGS)

clean-public:
	rm -rf public/server
	rm -rf public/web-cli
	rm -rf public/mobile-cli

# Needed to pass arguments to the docker command...
# If the first argument is "docker"
ifeq (docker,$(firstword $(MAKECMDGOALS)))
  # use the rest as arguments for "docker"
  DOCKER_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  # ...and turn them into do-nothing targets
  $(eval $(DOCKER_ARGS):;@:)
endif

docker:
	./resources/docker-nginx/vaultage.sh $(DOCKER_ARGS)

.PHONY: clean-public clean all docker $(BUILDPKGS) $(CLEANPKGS)
