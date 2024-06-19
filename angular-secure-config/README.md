
# Introduction to thiqah-angular-secure-config

## Overview
`thiqah-angular-secure-config` is a new npm package developed by our company to address a security vulnerability in Angular applications. This package ensures that sensitive configuration data in `config.json` is protected from being inspected or extracted via browser network tools or debugging features.

## Problem Statement
Many developers switch from using `environment.ts` to `config.json` for application configuration. This change requires making an HTTP request to access the `config.json` at runtime, which exposes the file to potential security risks.

## Solution
`thiqah-angular-secure-config` resolves this issue by encrypting the `config.json` file before the application starts. Upon startup, the application decrypts the file in `main.ts` and stores the data in a static variable, ensuring the configuration remains secure.

## Development Guide

### Development Mode

1. **Install the Package**
   ```sh
   npm install thiqah-angular-secure-config
   ```

2. **Run the Package**
   - For NPM:
     ```sh
     thiqah-angular-secure-config run
     ```
   - For YARN:
     ```sh
     thiqah-angular-secure-config run --use-yarn
     ```

3. **Create `config.service.ts`**
   
   Implement a service to handle the decrypted configuration data.

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
    
    ```typescript
    export interface EnvironmentConfig {
      encrypted: string;
      key: string;
      iv: string;
    }
    ```
    
    ## AppConfig Interface
    
    ```typescript
    export interface AppConfig {
      title: string;
      version: string;
      baseUrl: string;
    }
    ```

4. **Create `config.json`**
   
   Place your configuration file at `../assets/configuration/config.json`.
   
   ```json
    {
      "title": "Thiqah Angular Secure Config",
      "version": "V 1.0.0",
      "baseUrl": "http://localhost:4200"
    }

   ```

5. **Add `env.js` to Build Assets**

   Ensure `env.js` is included in your build assets for environment-specific configurations.

6. **Add prestart command into `package.json`**

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

7. **Update `angular.json` for Production**
   
   Add necessary properties to your `angular.json` file to support the secure configuration in production.

   
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


### Production Mode

1. **IIS Deployment**
   - Build the production version of your application:
     ```sh
     ng build --prod
     ```
   - Run the obfuscation script:
     ```sh
     node obfuscate.js
     ```

2. **Docker Deployment**
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
