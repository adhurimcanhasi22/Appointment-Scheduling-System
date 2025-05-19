FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Specify port
EXPOSE 5000

# Start the application
CMD ["npm", "run", "dev"]