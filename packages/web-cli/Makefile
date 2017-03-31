SDK_SRC=../js-sdk/dist/vaultage.js
SDK=deps/vaultage.js

all: $(SDK)

clean:
	rm $(SDK)

deps:
	mkdir deps

$(SDK): $(SDK_SRC) deps
	cp $(SDK_SRC) $(SDK)

.PHONY: clean