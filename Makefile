PKG_DIR=packages
PACKAGES=$(PKG_DIR)/js-sdk $(PKG_DIR)/web-cli

all: $(PACKAGES) dist-cli

$(PACKAGES):
	$(MAKE) -C $@

dist-cli: clean-web-cli
	cp -r packages/web-cli public/

clean-web-cli:
	rm -rf public/web-cli

.PHONY: all $(PACKAGES)