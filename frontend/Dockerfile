# Use a newer Node.js version
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the app
RUN npm run build

# Install serve
RUN npm install -g serve

# Start the app
CMD ["serve", "-s", "build", "-l", "3000"]