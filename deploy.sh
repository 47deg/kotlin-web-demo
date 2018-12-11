#!/usr/bin/env bash

rm -rf try.arrow-kt.web

git clone https://github.com/JetBrains/kotlin-web-demo try.arrow-kt.web

sudo cp deploy/docker-compose.yml ./try.arrow-kt.web

sudo cp arrow/arrowKtVersion ./try.arrow-kt.web

sudo cp deploy/.secret ./try.arrow-kt.web

sudo cp ./cert/* ./try.arrow-kt.web/docker/frontend/conf

sudo cp server.xml ./try.arrow-kt.web/docker/frontend/conf

for i in ./try.arrow-kt.web/versions/*/build.gradle
do
   awk 'FNR==1{print ""}1' arrow/arrow-dependencies >> $i
done

awk 'FNR==1{print ""}1' arrow/arrow-repositories >> ./try.arrow-kt.web/build.gradle

awk 'FNR==1{print ""}1' deploy/web-demo-backend >> ./try.arrow-kt.web/docker/backend/Dockerfile

awk 'FNR==1{print ""}1' deploy/web-demo-war >> ./try.arrow-kt.web/docker/frontend/Dockerfile

awk 'FNR==1{print ""}1' arrow/arrow-executors-policy >> ./try.arrow-kt.web/kotlin.web.demo.backend/src/main/resources/executors.policy.template

cd try.arrow-kt.web

sh gradlew

mkdir ./docker/frontend/war/

mkdir ./docker/backend/war/

export ARROW_VERSION=$(cat arrow/arrowKtVersion)

sh gradlew ::copyKotlinLibs

sh gradlew clean

sh gradlew war

sudo mv ./kotlin.web.demo.server/build/libs/WebDemoWar.war ./docker/frontend/war/WebDemoWar.war

sudo mv ./kotlin.web.demo.backend/build/libs/WebDemoBackend.war ./docker/backend/war/WebDemoBackend.war

sudo docker-compose down

sudo docker system prune -a -f

sudo docker volume rm $(sudo docker volume ls -qf dangling=true)

sudo docker-compose build

sudo docker-compose up -d