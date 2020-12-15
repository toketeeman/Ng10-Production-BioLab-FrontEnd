# ProteinExpressionFrontEnd

A solo-authored production-level Angular 10 biomanufacturer (undisclosed) lab tool for compiling molecular DNA sequence databases during the molecular fabrication process. Actively used daily by lab technicians and scientists. Employs four levels of Angular environment configurations to accommodate CI/CD, specifically using in-memory-web-db for code implementation, Docker Desktop for phasing more advanced development with real-end-point simulation, and the staging/production automated deployment environments. Interfaced to various PostgreSQL-based REST back-ends. Angular Material was employed throughout, but advanced styling was limited due to the utilitarian priority of this software. The UI is also extensively responsive to support both monitors and tablets. Finally, Angular purity has been maintained: no unnecessary third-party dependencies such as Bootstrap and jQuery have been used.

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
docker build --file Dockerfile-prod -t ptdbfe10 .
```

To test the production build, you can run:

```
docker run -dit -p 8001:8001 ptdbfr10
```

To run your dev environment out of a Docker container instead of using your local environment, run:

```
docker build -t ptdbfe10 .
docker run  -v .:/app -p 4200:4200 -it ptdbfe10
```
