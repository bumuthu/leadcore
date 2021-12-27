#!/bin/bash

git pull 

docker stop $(docker ps -aq)
docker rm $(docker ps -aq)

cd ./scraper
docker build -t leadquo/scraper .
cd ..

docker-compose up -d