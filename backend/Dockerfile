FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies (fresh, no cache)
RUN npm install --production

# Copy app source
COPY . .

# Expose port
EXPOSE 5001

# Start
CMD ["node", "server.js"]
