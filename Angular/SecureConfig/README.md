# Thiqah Angular Secure Configuration

## Overview

`thiqah-secure-config` is a new npm package developed by our company to address a security vulnerability in Angular applications. This package ensures that sensitive configuration data in `config.json` is protected from being inspected or extracted via browser network tools or debugging features.

## Problem Statement

Many developers switch from `environment.ts` to `config.json` for application configuration. This change requires an HTTP request to access the `config.json` at runtime, exposing the file to potential security risks.

## Solution

`thiqah-secure-config` resolves this issue by encrypting the `config.json` file before the application starts. Upon startup, the application decrypts the file in `main.ts` and stores the data in a static variable, ensuring the configuration remains secure.

## Features

- **Encryption:** Secure your configuration data by encrypting the `config.json` file.
- **Decryption:** Seamlessly decrypt the configuration data in the `main.ts` file.
- **Dockerfile:** Provides a Dockerfile for containerizing your Angular application with secure configuration handling.
- **Obfuscation:** Adds a layer of security by obfuscating the application source.
- **Integration with Vault:** Utilizes Vault for securely managing sensitive data.
- **Config-Map Compatibility:** Works with Kubernetes ConfigMaps to replace actual values from Vault before encryption.

## Demo

You can find a complete implementation at [Stackblatz - Angular Secure Config](https://stackblitz.com/edit/stackblitz-starters-yv8x5f)

## Getting Started

1. **Create a new angular application**

   ```sh
   $ ng new angular-app
   ```

2. **Install the package**

   ```sh
   $ npm install thiqah-secure-config
   ```

3. **Run the package**

- Run package help:

  ```sh
  $ thiqah-secure-config help
  ```

- Run package and its dependancies via NPM:
  ```sh
  $ thiqah-secure-config run
  ```
- Run package and its dependancies via YARN:
  ```sh
  $ thiqah-secure-config run --use-yarn
  ```
- Specify the name of the configuration file (default: config.json):
  ```sh
  $ thiqah-secure-config run --config-file-name custom-config.json
  ```

4. **Create `AppConfig` model**

   Create a new model that represents your `../assests/configuration/config.json` file.

   ```json
   {
     "production": false,
     "title": "Thiqah Angular Secure Config",
     "version": "V 1.0.0",
     "app": {
       "baseUrl": "http://localhost:4200"
     }
   }
   ```

   ```ts
   export interface AppConfig {
     production: boolean;
     title: string;
     version: string;
     app: App;
   }
   export interface App {
     baseUrl: string;
   }
   ```

   > Note: Ensure `config.json` changes were added to the `AppConfig` model to be up-to-date.

5. **Update `app.module.ts`**

   Inject the `APP_INITIALIZER` into `AppModule` providers.

   ```ts
   import { NgModule, APP_INITIALIZER } from "@angular/core";
   import { BrowserModule } from "@angular/platform-browser";
   import { AppRoutingModule } from "./app-routing.module";
   import { AppComponent } from "./app.component";
   import { ConfigService } from "thiqah-res";
   import { AppConfig } from "../shared/models/app-config";

   function appConfigLoader(ConfigService: ConfigService<AppConfig>) {
     return () => ConfigService.init();
   }

   @NgModule({
     declarations: [AppComponent],
     imports: [BrowserModule, AppRoutingModule],
     providers: [
       {
         provide: APP_INITIALIZER,
         multi: true,
         deps: [ConfigService],
         useFactory: appConfigLoader,
       },
     ],
     bootstrap: [AppComponent],
   })
   export class AppModule {}
   ```

## Usage

```ts
import { Component } from "@angular/core";
import { ConfigService } from "thiqah-res";
import { AppConfig, App } from "../shared/models/app-config";

@Component({
  selector: "app-root",
  template: `
    <h2>App Config Data</h2>
    <p><b>Title:</b> {{ appConfig?.title }}</p>
    <p><b>Version:</b> {{ appConfig?.version }}</p>
    <p><b>BaseUrl:</b> {{ appConfig?.app?.baseUrl }}</p>
  `,
})
export class AppComponent {
  public appConfig: AppConfig | null = null;
  public appBaseUrl: string = "";

  constructor(private configService: ConfigService<AppConfig>) {
    this.appConfig = ConfigService.readConfig<AppConfig>();
    this.appConfig.app = {
      baseUrl: configService.getOne("app")?.baseUrl || "",
    } as App;
  }
}
```

## Run the application

```sh
$ node encrypt-config.js && ng serve -o
```

```sh
$ npm start
```

## Deployment

1. **Manual**

   - Build the production version of your application:
     ```sh
     $ ng build --prod
     ```
   - Run the obfuscation script:
     ```sh
     $ node obfuscate.js
     ```

2. **Docker**
   - Run the package with Docker support:
     - For NPM:
       ```sh
       $ thiqah-secure-config run --include-dockerfile
       ```
     - For YARN:
       ```sh
       $ thiqah-secure-config run --use-yarn --include-dockerfile
       ```

By following this guide, you can ensure your Angular application configuration is securely managed, preventing unauthorized access and enhancing the overall security of your application.
