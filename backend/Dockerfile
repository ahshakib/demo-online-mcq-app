FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Ensure upload directories exist
RUN mkdir -p uploads/profile uploads/questions uploads/explanations

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "./src/server.js"]
