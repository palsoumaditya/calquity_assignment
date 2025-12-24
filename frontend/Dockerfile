# frontend/Dockerfile

# 1. Use Node 20 (Required for Next.js 14/15)
FROM node:20-alpine

WORKDIR /app

# 2. Install dependencies
COPY package*.json ./
RUN npm install

# 3. Copy source code
COPY . .

# 4. Build the app
RUN npm run build

# 5. Start the app
EXPOSE 3000
CMD ["npm", "start"]