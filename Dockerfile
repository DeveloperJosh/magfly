# Dockerfile
FROM node:18-alpine

# Install ffmpeg for transcoding
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port for Next.js
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
