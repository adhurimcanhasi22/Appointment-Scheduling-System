FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy necessary files
COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY shared ./shared
COPY services/notification-service ./services/notification-service
COPY server ./server 


# Specify port
EXPOSE 3003

# Start the service
CMD ["node", "--require", "tsx", "services/notification-service/index.ts"]