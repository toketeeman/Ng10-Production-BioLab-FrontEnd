# ProteinExpressionFrontEnd

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.0.5.
It has since been upgraded to version 10.1.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Note: There is NO application-specific end-to-end testing implemented other than the default one provided by the Angular CLI.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Docker

To build a docker image containing a production build of this application, run:

```
docker build --file -t ptdbfe10 Dockerfile-prod .
```

To test the production build, you can run:

```
docker run -dit -p 8080:80 ptdbfr10
```

To run your dev environment out of a Docker container instead of using your local environment, run:

```
docker build -t ptdbfe10 .
docker run  -v .:/app -p 4200:4200 -it ptdbfe10
```
