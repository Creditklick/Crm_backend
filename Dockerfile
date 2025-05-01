FROM node:12.2.0-alpine
WORKDIR /CRM_NODE
COPY . .
RUN npm install --legacy-peer-deps
EXPOSE 8000
CMD ["node", "index.js"]
