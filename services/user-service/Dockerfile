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
COPY services/user-service ./services/user-service
COPY server ./server 
# REMOVE THESE INDIVIDUAL FILE COPIES AS THEY ARE NOW INCLUDED IN THE 'server' COPY:
# COPY server/db.ts ./server/db.ts
# COPY server/services/userService.ts ./server/services/userService.ts

# Specify port
EXPOSE 3001

# Start the service
CMD ["node", "--require", "tsx", "services/user-service/index.ts"]