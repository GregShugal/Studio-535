FROM node:20-slim
WORKDIR /app
COPY package.json ./
# Install deps with npm (legacy peer deps for vite plugin conflict)
RUN npm install --legacy-peer-deps
COPY . .
# Build
RUN npm run build
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/index.cjs"]