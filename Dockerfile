# Use Node 22 Alpine as base
FROM node:22-alpine

# Install git + openssh for repo work
RUN apk add --no-cache git openssh

# Set working directory
WORKDIR /app

# Copy only package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of project
COPY . .

# Expose Vite dev port
EXPOSE 5173

# Default: run vite dev server
CMD ["npm", "run", "dev"]
