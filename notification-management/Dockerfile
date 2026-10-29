# Dockerfile
FROM node:22

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build   # only if using TypeScript


EXPOSE 5004
EXPOSE 50054
CMD ["npm", "run" , "dev"]
