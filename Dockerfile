FROM node:22

# Install pandoc
RUN apt-get update && apt-get install -y pandoc

WORKDIR /app
COPY . .

RUN npm install

CMD ["node", "server.js"]