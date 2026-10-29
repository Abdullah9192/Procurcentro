FROM node:22

RUN apt-get update && apt-get install -y \
    libreoffice \
    libreoffice-writer \
    fonts-dejavu \
    fonts-liberation \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV LIBREOFFICE_BIN=/usr/bin/soffice

WORKDIR /app

# Copy package files first
COPY package*.json ./
RUN npm install

# Copy proto files to both src and dist locations
# COPY src/protos/ ./src/protos/
# RUN mkdir -p ./dist/protos && cp -r ./src/protos/* ./dist/protos/

# Copy other source files
COPY . .

# Build (if using TypeScript)
RUN npm run build

# Verify files exist
# RUN ls -la /app/dist/protos/


EXPOSE 50016
# EXPOSE 50051
CMD ["npm", "run" , "dev"]
# CMD ["npm", "run" , "start"]
