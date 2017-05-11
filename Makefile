PKG_DIR=packages
PACKAGES=js-sdk web-cli chrome-ext

BUILDPKGS = $(addprefix $(PKG_DIR)/, $(PACKAGES))
CLEANPKGS = $(PACKAGES:%=clean-%)

all: $(BUILDPKGS) dist-cli

$(BUILDPKGS):
	$(MAKE) -C $@

$(CLEANPKGS):
	$(MAKE) -C $(@:clean-%=%) clean

dist-cli: clean-public
	cp -r packages/web-cli public/

clean: clean-public $(CLEANPKGS)

clean-public:
	rm -rf public/web-cli

.PHONY: clean-public clean all $(BUILDPKGS) $(CLEANPKGS)