# Offcial Node runtime parent image
FROM node:18

#Set working dir in container
WORKDIR /app

# Intall ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Copy package and package-lock into working dir
COPY package*.json ./

#Install all packages
RUN npm install

# Copy app source inside docker image
COPY . .

# Make port 3000 avaible outside this container
EXPOSE 3000

# Define command to run app
CMD ["npm", "start"]