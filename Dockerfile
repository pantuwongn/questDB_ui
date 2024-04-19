FROM node:16-alpine

# make the 'app' folder the current working directory
WORKDIR /app

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

# install project dependencies
RUN yarn

RUN yarn workspace @questdb/react-components build

EXPOSE 9999
CMD [ "yarn", "workspace", "@questdb/web-console", "start"]