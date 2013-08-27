MOCHA = ./node_modules/.bin/mocha

test:
	@NODE_ENV=test $(MOCHA) ./test/*\
				-r should \
				-R spec
	
.PHONY: test
