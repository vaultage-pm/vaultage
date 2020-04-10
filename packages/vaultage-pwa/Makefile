DIST_ROOT=dist/vaultage-pwa/index.html

.PHONY: all serve clean build

all: serve build

serve:
	npm run start

clean:
	rm -rf dist

build:
	npm run build -- --prod

test:
	npm run lint
	npm run test -- --watch=false --browsers=ChromeHeadless

