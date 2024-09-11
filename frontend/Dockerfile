FROM node:18-alpine  AS production
WORKDIR /app
COPY frontend/package*.json ./frontend/
COPY ./shared ./shared
RUN ls -la
WORKDIR /app/frontend
RUN npm config set registry https://registry.npmjs.org/
RUN npm ci --omit=dev
COPY ./backend/src/types  ../backend/src/types
COPY ./frontend ./
CMD ["npm", "start"] 

FROM node:18-alpine AS development
WORKDIR /app/frontend
CMD npm install && npm run dev
