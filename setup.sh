#!/usr/bin/env bash

sudo apt-get update

sudo apt-get -y install \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

sudo apt-key fingerprint 0EBFCD88

sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"

sudo apt-get update

sudo apt-get -y install python

sudo apt-get -y install docker-ce

sudo service docker start

sudo apt-get -y install openjdk-8-jdk

sudo curl -L https://github.com/docker/compose/releases/download/1.21.2/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

sudo apt install -y gradle

gradle wrapper

git clone https://github.com/47deg/try.arrow-kt.io.git

sudo apt-get install -y software-properties-common

sudo add-apt-repository -y universe

sudo add-apt-repository -y ppa:certbot/certbot

sudo apt-get update

sudo apt-get install -y certbot

mkdir try.arrow-kt.io/cert

echo "Please, introduce the domain's name you want to generate the certificate for:"

read domain

sudo certbot certonly --standalone -d $domain

sudo cp -r /etc/letsencrypt/live/$domain/* try.arrow-kt.io/cert/

echo "If the copy of the files fail because certbot has saved them in a different directory, you will need to copy them manually to try.arrow-kt.io/cert/"