FROM node:22-alpine

# Create app user
RUN adduser --home /app --disabled-password app

# Set user to non-root
USER app

# Set the working directory in the container
WORKDIR /app

COPY --chown=app:app package*.json ./

RUN npm install

# Copy the application to the working directory
COPY --chown=app:app source/watcher source/watcher

# Run main.js when the container launches
CMD ["node", "source/watcher/main.js"]
