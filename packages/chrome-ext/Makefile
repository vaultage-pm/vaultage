BINS = vaultage-app.js vaultage-background.js

DEPS += node_modules/angular-material/angular-material.js
DEPS += node_modules/angular/angular.js
DEPS += node_modules/angular-material/angular-material.css
DEPS += node_modules/angular-aria/angular-aria.js
DEPS += node_modules/angular-animate/angular-animate.js
DEPS += res
DEPS += $(wildcard templates/*.html)
DEPS += manifest.json
DEPS += popup.html
DEPS += icon.png

SRC = src/*.ts src/*/*.ts

SDK_DIR = ../js-sdk
SDK = $(SDK_DIR)/dist/vaultage.js

DIST_DEPS = $(addprefix dist/, $(DEPS))
DIST_BINS = $(addprefix dist/, $(BINS))

.PHONY: all
all: $(DIST_BINS) $(DIST_DEPS)

$(DIST_BINS): $(SDK) node_modules $(SRC) webpack.config.js
	node_modules/.bin/webpack

.PHONY: clean
clean:
	rm -rf dist/

.PHONY: mrproper
mrproper:
	rm -rf node_modules

$(DIST_DEPS): node_modules $(DEPS)
	cp -r --parents $(@:dist/%=%) dist/

node_modules:
	npm install

$(SDK):
	make -C $(SDK_DIR)

