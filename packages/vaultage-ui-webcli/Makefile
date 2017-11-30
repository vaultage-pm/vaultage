SRC=$(shell find src/ -type f -name '*.ts')
BIN=public/dist/main.js
VAULTAGE_CLIENT=../vaultage-client/dist/vaultage.js

# Mandatory tasks (imposed by the top-level Makefile)

.PHONY: $(VAULTAGE_CLIENT)
$(VAULTAGE_CLIENT):
	$(MAKE) -C ../vaultage-client build
	mkdir -p public/dist
	cp $(VAULTAGE_CLIENT) public/dist

.PHONY: build
build: $(VAULTAGE_CLIENT) $(BIN)

.PHONY: clean
clean:
	rm -rf public/dist/

.PHONY: cleanall
cleanall: clean
	rm -rf node_modules

.PHONY: test
test: node_modules
	echo "No tests for now"


# Other tasks

$(BIN): $(SRC) node_modules
	npm run build

.PHONY: serve
serve: build
	npm run serve

node_modules: package.json package-lock.json
	npm install
