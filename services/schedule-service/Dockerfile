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
COPY services/schedule-service ./services/schedule-service
COPY server ./server 


# Specify port
EXPOSE 3002

# Start the service
CMD ["node", "--require", "tsx", "services/schedule-service/index.ts"]