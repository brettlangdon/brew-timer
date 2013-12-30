export PATH:=./node_modules/.bin:$(PATH)

compile: install
	jade index.jade
	cleancss styles/main.css -o styles/main.min.css
	cleancss styles/general_foundicons.css -o styles/general_foundicons.min.css
	cleancss styles/general_foundicons_ie7.css -o styles/general_foundicons_ie7.min.css
	uglifyjs scripts/main.js -o scripts/main.min.js

install:
	npm install

.PHONY: compile
