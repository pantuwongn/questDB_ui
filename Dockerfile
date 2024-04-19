FROM node:20-alpine

# install simple http server for serving static content
RUN npm install -g http-server

# make the 'app' folder the current working directory
WORKDIR /app

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# install project dependencies
RUN yarn

RUN yarn workspace @questdb/react-components build

RUN yarn workspace @questdb/web-console build

EXPOSE 9999

CMD [ "http-server", "./packages/web-console/dist", "--port", "9999"]   