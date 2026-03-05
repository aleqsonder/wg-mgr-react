#!/bin/sh

# install act
curl https://raw.githubusercontent.com/nektos/act/master/install.sh \
	| sudo BINDIR=/bin sh

# install npm requirements
sudo npm install
