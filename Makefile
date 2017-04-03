PKG_DIR=packages
PACKAGES=$(PKG_DIR)/js-sdk $(PKG_DIR)/web-cli
CLEANPKGS = $(PACKAGES:%=clean-%)

all: $(PACKAGES) dist-cli

$(PACKAGES):
	$(MAKE) -C $@

$(CLEANPKGS):
	$(MAKE) -C $(@:clean-%=%) clean

dist-cli: clean-web-cli
	cp -r packages/web-cli public/

clean: clean-web-cli $(CLEANPKGS)


clean-web-cli:
	rm -rf public/web-cli

.PHONY: clean-web-cli clean all $(PACKAGES) $(CLEANPKGS)