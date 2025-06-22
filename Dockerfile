FROM node:22

# Install pandoc and a TeX engine for PDF output
RUN apt-get update \
  && apt-get install -y pandoc texlive-xetex \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

RUN npm install

CMD ["node", "server.js"]