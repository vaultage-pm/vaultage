SRC=$(shell find src/ -type f -name '*.ts')
BIN=dist/background.js
VAULTAGE_CLIENT=../vaultage-client/dist/vaultage-sjcl.js
LOCAL_VAULTAGE=dist/vaultage.js
NODE_MODULES=node_modules/.makets

.PHONY: build
build: $(BIN)

.PHONY: clean
clean:
	rm -rf dist/

$(LOCAL_VAULTAGE): $(VAULTAGE_CLIENT)
	$(MAKE) -C ../vaultage-client build
	mkdir -p dist
	cp $(VAULTAGE_CLIENT) dist/vaultage.js

.PHONY: cleanall
cleanall: clean
	rm -rf NODE_MODULES

.PHONY: test
test: $(NODE_MODULES)
	npm run test

# Other tasks

$(BIN): $(SRC) $(NODE_MODULES) $(LOCAL_VAULTAGE)
	npm run build

$(NODE_MODULES): package.json package-lock.json
	npm install
	touch $(NODE_MODULES)
