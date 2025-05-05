FROM node:18-alpine
WORKDIR /CRM_NODE
COPY . .
RUN npm install --legacy-peer-deps
EXPOSE 8000
CMD ["npm", "start"]
