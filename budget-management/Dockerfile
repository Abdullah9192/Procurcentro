FROM node:22

WORKDIR /app

# Copy package files first
COPY package*.json ./
RUN npm install

# Copy proto files to both src and dist locations
COPY src/protos/ ./src/protos/
RUN mkdir -p ./dist/protos && cp -r ./src/protos/* ./dist/protos/

# Copy other source files
COPY . .

# Build (if using TypeScript)
RUN npm run build

# Verify files exist
RUN ls -la /app/dist/protos/


EXPOSE 5005
EXPOSE 50055
CMD ["npm", "run" , "dev"]
