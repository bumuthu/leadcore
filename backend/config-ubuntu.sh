sudo apt-get update
sudo apt-get upgrade

curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs

git clone https://github.com/bumuthu/leadcore.git

cd leadcore/backend

npm install
npm run dev