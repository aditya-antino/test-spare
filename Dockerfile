FROM node:20-bullseye-slim

WORKDIR /app

# IMPORTANT: don't set NODE_ENV yet
COPY package*.json ./
RUN npm install

COPY . .

# Build requires devDependencies (typescript)
RUN npm run build

# Now switch to production + prune
ENV NODE_ENV=production
RUN npm prune --omit=dev

EXPOSE 3000

CMD ["npm", "run", "start"]
