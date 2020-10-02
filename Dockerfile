FROM node
WORKDIR /app
COPY . .

RUN npm install
RUN npm install -g @angular/cli

RUN ng build

EXPOSE 4200
CMD ng serve --host 0.0.0.0
