git pull 

docker stop $(docker ps -aq)
docker rm $(docker ps -aq)

cd ./scraper
docker build -t leadcore/scraper .
cd ../backend
docker build -t leadcore/api .
cd ..

docker-compose up -d