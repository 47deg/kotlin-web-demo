[![Build Status](https://api.travis-ci.org/47deg/try.arrow-kt.io.svg?branch=master)](https://travis-ci.org/47deg/try.arrow-kt.io)

This repository contains the scripts and necessary files to deploy [Try Arrow](https://try.arrow-kt.io:80) in an AWS EC2 instance.

Try Arrow uses the [kotlin-web-demo](https://github.com/JetBrains/kotlin-web-demo) project and modifies it to include the [Arrow](https://github.com/arrow-kt/arrow) library and to provide it the ability to be automatically deployed in an AWS EC2 instance using [Travis CI](https://travis-ci.org).

## Project structure:

- The main scripts that do all the "hard work" are `setup.sh` and `deploy.sh`:
  - The `setup.sh` script is intended to install in the instance all the necessary software (docker, docker-compose, gradle, ...) to deploy the project. It will have to be run only once.
  - The `deploy.sh` script will be executed every time a new deployment is triggered and will take care of downloading the required version of Try Kotlin, modifying it, compiling the project, cleaning the instance up and, using docker-compose, building and starting the containers.
- `arrow` directory contains the following files:
  - `arrow-dependencies`: Includes the Arrow library's dependencies that will be inserted in the `build.gradle` files of each Kotlin's compiler version.
  - `arrow-executors-policy`: Contains some Java Security Policies needed to run code from the Arrow docs and will be included in the `executors.policy.template` file.
  - `arrow-repositories`: The Arrow repositories where to download the libraries. This will be also inserted in all `build.gradle` files inside Kotlin's compiler versions.
  - `arrowKtVersion`: The Arrow version used during the deployment.
- `deploy` directory with the following files:
  - `.secret`: This is an encrypted certificate file that will be decrypted inside Travis CI, using the right key, and that will be used to connect via ssh with the AWS EC2 instance.
  - `docker-compose`: Will build and start the three containers (`frontend`, `backend` and `db`).
  - `web-demo-backend` and `web-demo-war`: The content from these files will be added to the `backend` and `frontend` Docker files to make to the Tomcat servers, that will be running in each of these containers, using our own war files compiled including the Arrow library.
- `.travis.yml` will allow Travis CI to decrypt a certificate file using the appropriate key, it will connect via ssh to the AWS EC2 instance and trigger a new deployment using the `deploy.sh` script.

## Deploy to AWS:

### Initial setup:

- Create a [AWS VPC](https://aws.amazon.com/vpc) in the [VPC Dashboard](https://console.aws.amazon.com/vpc) to allow your instance to send and receive traffic from the Internet.
- Create an AWS EC2 instance in [EC2 console](https://console.aws.amazon.com/ec2) (Ubuntu Server, t2.large recommended with 16 GB storage), choosing your previously created VPC in the `Network` option.
- Download the generated private key and save as `try-arrow-kt.pem` file (or some other name of you choice)
- ```cp try-arrow-kt.pem ~/.ssh```
- ```chmod 400 ~/.ssh/try-arrow-kt.pem```
- Clone this project in your machine with `git clone git@github.com:47deg/try.arrow-kt.io.git`.
- Copy the `setup.sh` file from this project to your instance using: ```scp setup.sh <user>@<instance's public dns>:```
- ```ssh -i ~/.ssh/try-arrow-kt.pem <user>@<instance's public dns>```
- Run ```sh setup.sh``` to set up your EC2 instance for the deployment.

### Deployment:

- You can trigger a manual deployment by copying this repo to EC2 and then connecting to the instance via ssh:
    - ```cd try.arrow-kt.io```
    - ```scp -i  ~/.ssh/try-arrow-kt.pem -r * user@<instance' public dns>:try.arrow-kt.io```
    - ```ssh -i ~/.ssh/try-arrow-kt.pem <user>@<instance's public dns>```
    - run ```cd try.arrow-kt.io; sh deploy.sh``` in the EC2 instance.

- To set up an automatic deployment with `Travis CI`:
    - Go back to your local machine and run:
    - ```export TRAVIS_CI_SECRET=`cat /dev/urandom | head -c 10000 | openssl sha1` ```
    - ```openssl aes-256-cbc -pass "pass:$TRAVIS_CI_SECRET" -in ~/.ssh/try-arrow-kt.pem -out ./.secret -a```
    - Commit `.secret` file and upload changes.
    - Create env var in travis for `$TRAVIS_CI_SECRET`
    - Create env var in travis for `$EC2 = <user>@<instance's public dns>`
    - This has already been included in the .travis.yml file for this to work:
    ```before_script
       - openssl aes-256-cbc -pass "pass:$TRAVIS_CI_SECRET" -in ./.secret -out ./try-arrow-kt.pem -d -a
       - chmod 400 ./try-arrow-kt.pem```


[comment]: # (Start Copyright)
# Copyright

try.arrow-kt.io is designed and developed by 47 Degrees

Copyright (C) 2019 47 Degrees. <http://47deg.com>

[comment]: # (End Copyright)
