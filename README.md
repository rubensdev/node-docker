## Build the image
docker build -t node-app-image .

## Run the container from the image 'node-app-image'
docker run -p 3000:3000 -d --name node-app node-app-image

## Anonymous Volumes hack (prevents the deletion of the node_modules folder)
docker run -v $PWD:/app -v /app/node_modules -p 3000:3000 -d --name node-app node-app-image

## Once a container is created, we can EXECute commands in it
docker exec -it node-app bash

## Read-Only bind mounts (best practices)
docker run -v $PWD:/app:ro [...]

## Passing environment variables
docker run -v $PWD:/app:ro --env PORT=4000 -p 3000:4000 [...]

## Passing an environment variable file
docker run --env-file ./.env

## List volumes
docker volume ls

## Delete the volume created (/app/node_modules)
docker rm node-app -fv

## With docker-compose down -v, we delete the volumes too
docker-compose down -v

## Run just one service without service dependencies
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --no-deps <name_of_service>

## Create two instances of node-app
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --scale node-app=2
