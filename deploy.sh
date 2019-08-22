#!/usr/bin/env bash

git checkout master

git pull

rm -rf try.arrow-kt.web

git clone https://github.com/JetBrains/kotlin-web-demo try.arrow-kt.web

sudo cp deploy/docker-compose.yml try.arrow-kt.web

sudo cp arrow/arrowKtVersion try.arrow-kt.web

sudo cp deploy/.secret try.arrow-kt.web

sudo cp cert/* -r try.arrow-kt.web/docker/frontend/conf #TODO: There is no cert dir right now.

sudo cp server.xml try.arrow-kt.web/docker/frontend/conf

curl -s https://oss.jfrog.org/api/storage/oss-snapshot-local/io/arrow-kt |
   python -c "import json,sys;obj=json.load(sys.stdin);print '\n'.join([item['uri'] for item in obj['children']]);" |
  awk 'gsub("/", "");' > arrow/arrow-full-dependencies
awk 'NR==FNR{a[$0];next} !($0 in a)' arrow/arrow-deprecated-dependencies arrow/arrow-full-dependencies |
awk 'BEGIN{print "dependencies {\n\tdef arrowKtVersion = System.getenv('\''ARROW_VERSION'\'')\n"};
    {
        $0 = "\tlibrary group: '\''io.arrow-kt'\'', name: '\''"$0"'\'', version: arrowKtVersion";
        print;
    }
    END{print "\n\tcompile fileTree(dir: projectDir.toString() + File.separator + \"kotlin\", include: '\''*.jar'\'')\n}"}' > arrow/arrow-dependencies

rm -rf arrow/arrow-full-dependencies

for i in try.arrow-kt.web/versions/*/build.gradle
do
   awk 'FNR==1{print ""}1' arrow/arrow-dependencies >> $i
done

rm -rf arrow/arrow-dependencies

awk 'FNR==1{print ""}1' arrow/arrow-repositories >> try.arrow-kt.web/build.gradle

awk 'FNR==1{print ""}1' deploy/web-demo-backend >> try.arrow-kt.web/docker/backend/Dockerfile

awk 'FNR==1{print ""}1' deploy/web-demo-war >> try.arrow-kt.web/docker/frontend/Dockerfile

awk 'FNR==1{print ""}1' arrow/arrow-executors-policy >> try.arrow-kt.web/kotlin.web.demo.backend/src/main/resources/executors.policy.template

cd try.arrow-kt.web

sh gradlew

mkdir docker/frontend/war/

mkdir docker/backend/war/

export ARROW_VERSION=$(cat arrowKtVersion)

sh gradlew ::copyKotlinLibs

sh gradlew clean

sh gradlew war

sudo mv kotlin.web.demo.server/build/libs/WebDemoWar.war docker/frontend/war/WebDemoWar.war

sudo mv kotlin.web.demo.backend/build/libs/WebDemoBackend.war docker/backend/war/WebDemoBackend.war

sudo docker-compose down

sudo docker system prune -a -f

sudo docker volume rm $(sudo docker volume ls -qf dangling=true)  #TODO: This command failed. It does not seem to affect the final build.

sudo docker-compose build

sudo docker-compose up -d
