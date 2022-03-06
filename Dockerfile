FROM node:15

WORKDIR /app

COPY package.json ./

ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
        then npm install; \
        else npm install --only=production; \
        fi

# Needed because we copy the source code to keep it in the container in production
COPY . ./ 

ENV PORT 3000

EXPOSE $PORT

CMD ["node", "index.js"]