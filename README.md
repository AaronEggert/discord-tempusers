# Discord temporary users
This dicsord bot gives new users autoaticly a guest/temp role.<br> All users with this role will be kicked after a defined amount of time.

## Configuration
1. Create a [disord application](https://docs.discord4j.com/discord-application-tutorial/) 
2. edit the .env file

## Installation
clone repository: ```git clone https://github.com/AaronEggert/discord-tempusers.git```
### Directly with node.js
You need [nodejs](https://nodejs.org/de) and [npm](https://www.npmjs.com/package/npm) installed
<br>
Install all requiered packages: ```npm install```
<br>
Run the bot: ```node index.js```
### Docker
You need [docker](https://docs.docker.com/get-docker/) installed

build the image: ```docker build discord-tempusers:latest .```
#### Docker
run the container: ```docker run --name discord-tempusers -d discord-tempusers:latest```
#### docker-compose
you need to install the [docker-compose](https://docs.docker.com/compose/install/) plugin for docker
create a file: docker-compose.yml
```
version: '3.8'
services:
  discord-tempusers:
    image: discord-tempusers:latest
    restart: always
    volumes:
      - tempusers-volume:/usr/src/app
volumes:
  tempusers-volume:
```



## Commands
### Config
Usage: /config <role> <time (minutes)>
<br>
Role means the guest role. Time means the time in minutes, the user will be kicked after he joined the server.

### Status
Usage: /status <user (optional)>
<br>
Shows all user (or a specific) with the temp role and thier left time on the server


