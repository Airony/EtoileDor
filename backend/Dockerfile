FROM node:18-alpine AS base
RUN apk add --no-cache tzdata

FROM base AS build
WORKDIR /app
COPY backend/package*.json ./backend/
COPY ./shared ./shared
WORKDIR /app/backend
RUN npm config set registry https://registry.npmjs.org/
RUN npm ci
COPY ./backend ./
RUN ls -la
RUN npm run build

FROM base AS production
WORKDIR /app
RUN npm config set registry https://registry.npmjs.org/
COPY --from=build /app/backend/package*.json ./backend/
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/entrypoint_overwrited.sh ./backend/
COPY --from=build /app/backend/build ./backend/build
COPY --from=build /app/shared ./shared/
RUN ls -la
WORKDIR /app/backend
RUN npm ci --omit=dev
RUN chmod +x ./entrypoint_overwrited.sh
ENTRYPOINT source entrypoint_overwrited.sh

FROM base AS development
WORKDIR /app/backend
RUN npm config set registry https://registry.npmjs.org/
CMD npm install && npm run dev