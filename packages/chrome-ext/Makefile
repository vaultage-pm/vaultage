BINS = vaultage-app.js vaultage-background.js

DEPS += node_modules/angular-material/angular-material.js
DEPS += node_modules/angular-material/angular-material.css
DEPS += node_modules/angular-aria/angular-aria.js
DEPS += node_modules/angular-animate/angular-animate.js
DEPS += res
DEPS += templates/*.html
DEPS += manifest.json
DEPS += popup.html
DEPS += icon.png

SRC = src/*.ts src/*/*.ts

DIST_DEPS = $(addprefix dist/, $(DEPS))
DIST_BINS = $(addprefix dist/, $(BINS))

all: $(DIST_BINS) $(DIST_DEPS)

$(DIST_BINS): node_modules $(SRC) webpack.config.js
	node_modules/.bin/webpack

clean:
	rm -rf dist/ node_modules

$(DIST_DEPS): node_modules $(DEPS)
	cp -r --parents $(@:dist/%=%) dist/

node_modules: package.json
	npm install

.PHONY: clean