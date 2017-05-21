PKG_DIR=packages
PACKAGES=js-sdk web-cli chrome-ext

BUILDPKGS = $(addprefix $(PKG_DIR)/, $(PACKAGES))
CLEANPKGS = $(PACKAGES:%=clean-%)

all: $(BUILDPKGS) dist-cli

$(BUILDPKGS):
	$(MAKE) -C $@

$(CLEANPKGS):
	$(MAKE) -C $(addprefix $(PKG_DIR)/, $(@:clean-%=%)) clean

dist-cli: clean-public
	cp -r packages/web-cli public/

clean: clean-public $(CLEANPKGS)

clean-public:
	rm -rf public/web-cli

docker-start:
	./resources/docker-nginx/start.sh

docker-clean-all:
	./resources/docker-nginx/clean.sh

.PHONY: clean-public clean all docker-start $(BUILDPKGS) $(CLEANPKGS)
