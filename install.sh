#!/usr/bin/bash

git config --global user.email "iketutdharmawan2007@gmail.com"
git config --global user.name "Wan"
git init
git add *
git commit -m "new update"
git branch -M master
git remote add origin https://github.com/WanXdOffc/REST-APIs.git
git push -u origin master