FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Port where your Express app listens
EXPOSE 3001

CMD ["npm", "start"]