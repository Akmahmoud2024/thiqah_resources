
# Thiqah Angular Secure Configuration

## Overview
`thiqah-angular-secure-config` is a new npm package developed by our company to address a security vulnerability in Angular applications. This package ensures that sensitive configuration data in `config.json` is protected from being inspected or extracted via browser network tools or debugging features.

## Problem Statement
Many developers switch from using `environment.ts` to `config.json` for application configuration. This change requires making an HTTP request to access the `config.json` at runtime, which exposes the file to potential security risks.

## Solution
`thiqah-angular-secure-config` resolves this issue by encrypting the `config.json` file before the application starts. Upon startup, the application decrypts the file in `main.ts` and stores the data in a static variable, ensuring the configuration remains secure.

## Features
* __Encryption:__ Secure your configuration data by encrypting the `config.json` file.
* __Decryption:__ Seamlessly decrypt the configuration data in the `main.ts` file.
* __Dockerfile:__ Provides a Dockerfile for containerizing your Angular application with secure configuration handling.
* __Obfuscation:__ Adds an additional layer of security by obfuscating the application source.
* __Integration with Vault:__ Utilizes Vault for securely managing sensitive data.
* __Config-Map Compatibility:__ Works with Kubernetes ConfigMaps to replace actual values from Vault before encryption.

## Demo
 You can find out a complete implementation at [Stackblatz - Angular Secure Config](https://stackblitz.com/edit/stackblitz-starters-9qk5db?file=package.json)

## Getting Started

1. **Create a new angular application**

   ```sh
   ng new angular-app
   ```

2. **Install the package**

   ```sh
   npm install thiqah-angular-secure-config
   ```

3. **Run the package**
   - In case you are working with NPM:
     ```sh
     thiqah-angular-secure-config run
     ```
   - In case you are working with YARN:
     ```sh
     thiqah-angular-secure-config run --use-yarn
     ```

4. **Update `package.json` for development mode**

   Add **prestart** command into `scripts` to force your application to run a script before the start.

   ```json
   {
      ...
      "scripts": {
       "ng": "ng",
       "prestart": "node encrypt-config.js",
       "start": "ng serve --open",
       ...
     },
   ...
   }
   ```

5. **Import `env.js` into index.thml**

   Ensure `env.js` is imported in your _**index.html**_ as a script file.
 
   ```html
   <script src="env.js"></script>
   ```
   > __Hint:__ the `env.js` will be created automatically by the `encrypt-config.js` script.

6. **Update `angular.json` for production mode**
   
   Add necessary properties to your `angular.json` file to support the secure configuration in production and  ensure `env.js` is included in your build assets for environment-specific configurations.

   
   ```json
    {
      ...
      "projects": {
        "APPLICATION_NAME": {
          ...
          "architect": {
            "build": {
              "builder": "@angular-devkit/build-angular:browser",
              "options": {
                "outputPath": "dist", // keep this path for the obfuscate.js
                ...
                "assets": [
                  "src/favicon.ico",
                  "src/assets",
                  // Add the env.js
                  {
                    "glob": "env.js",
                    "input": "src/assets",
                    "output": "/"
                  }
                ],
              },
              "configurations": {
                "production": {
                  ...
                  // Add the below properties for better optimization
                  "outputHashing": "all",
                  "buildOptimizer": true,
                  "optimization": true,
                  "vendorChunk": false,
                  "extractLicenses": true,
                  "sourceMap": false,
                  "namedChunks": false
                },
              },
            },
          }
        }
      }
    }
   ```

7. **Create `config.json`**
   
   Place your configuration file at `../assets/configuration/config.json`.
   
   ```json
    {
      "title": "Thiqah Angular Secure Config",
      "version": "V 1.0.0",
      "app":{
         "baseUrl": "http://localhost:4200"
      }
    }

   ```
   
8. **Create `ConfigService`**
   
   Implement a service to handle the decrypted configuration data at `../app/core/services/config.service.ts`.

   ```typescript
    import { Injectable } from '@angular/core';
    import * as CryptoJS from 'crypto-js';
    import { AppConfig } from '../models/app-config';
    import { EnvironmentConfig } from '../models/environment-config';
    
    @Injectable({
      providedIn: 'root',
    })
    export class ConfigService {
      private static appConfig: any;
    
      constructor() {}
    
      public async init(): Promise<void> {
        if (!ConfigService.appConfig) ConfigService.appConfig = this.getConfig();
      }
      public getOne(key: string): any {
        if (!ConfigService.appConfig) {
          throw new Error('Config file not loaded !!!');
        }
        return ConfigService.appConfig[key];
      }
    
      static readConfig(): AppConfig {
        if (!ConfigService.appConfig) {
          const instance = new ConfigService();
          instance.init();
        }
        return { ...ConfigService.appConfig } as AppConfig;
      }
    
      private getConfig(): string {
        const data = this.loadConfig();
        if (!data)
          throw new Error(
            'Something went wrong while loading the configuration !!!'
          );
    
        const key = CryptoJS.enc.Hex.parse(data?.key);
        const iv = CryptoJS.enc.Hex.parse(data?.iv);
        const decrypted = CryptoJS.AES.decrypt(data?.encrypted, key, { iv: iv });
        const config = decrypted.toString(CryptoJS.enc.Utf8);
        return JSON.parse(config);
      }
      private loadConfig(): EnvironmentConfig {
        if (window['app']) {
          const env: string = window['app'];
          return {
            key: env.split(':')[0],
            encrypted: env.split(':')[1],
            iv: env.split(':')[2],
          } as EnvironmentConfig;
        }
      }
    }
    ```
    
    ## EnvironmentConfig Interface
    ### `../app/core/models/environment-config.ts`
    
    ```typescript
    export interface EnvironmentConfig {
      encrypted: string;
      key: string;
      iv: string;
    }
    ```
    
    ## AppConfig Interface
    ### `../app/core/models/app-config.ts`
    
    ```typescript
    export interface AppConfig {
      title: string;
      version: string;
      baseUrl: string;
    }
    ```
9. **Update `app.module.ts`**

   Inject the `APP_INITIALIZER` into `AppModule` providers.

   ```ts
   import { APP_INITIALIZER, NgModule } from '@angular/core';
   import { ConfigService } from './core/services/config.service';
   
   function appConfigLoader(ConfigService: ConfigService) {
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
   import { Component } from '@angular/core';
   import { ConfigService } from './core/services/config.service';
   import { AppConfig } from './core/models/app-config';
   
   @Component({
     selector: 'app-root',
     templateUrl: './app.component.html',
     styleUrls: ['./app.component.scss'],
   })
   export class AppComponent {
     public appConfig: AppConfig | null = null;
     public appBaseUrl: string = '';
   
     constructor(private configService: ConfigService) {
       this.appConfig = ConfigService.readConfig();
       this.appBaseUrl = configService.getOne('app')?.baseUrl || '';
     }
   }
   ```
 

## Deployment

1. **Manual**
   - Build the production version of your application:
     ```sh
     ng build --prod
     ```
   - Run the obfuscation script:
     ```sh
     node obfuscate.js
     ```

2. **Docker**
   - Run the package with Docker support:
     - For NPM:
       ```sh
       thiqah-angular-secure-config run --include-dockerfile
       ```
     - For YARN:
       ```sh
       thiqah-angular-secure-config run --use-yarn --include-dockerfile
       ```

By following this guide, you can ensure your Angular application configuration is securely managed, preventing unauthorized access and enhancing the overall security of your application.
