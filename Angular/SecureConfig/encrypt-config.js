const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

// Get configPath from command-line arguments
const configPathArg = process.argv[2];
const configFileName = 'config.json';

// Generate key and IV
const key = CryptoJS.lib.WordArray.random(32); // 32 bytes key for AES-256
const iv = CryptoJS.lib.WordArray.random(16);  // 16 bytes IV

// Read the config file
const localConfigPath = path.join(__dirname, 'src', 'assets', 'configuration', configFileName);
const hostConfigPath = path.join(`/usr/share/nginx/html/assets/configuration/${configFileName}`);
const configPath = configPathArg ? hostConfigPath : localConfigPath;
const config = fs.readFileSync(configPath, 'utf8');

// Encrypt the config file
const encrypted = CryptoJS.AES.encrypt(config, key, { iv: iv }).toString();

// Update env.js with the data
const localEnvironmentPath = path.join(__dirname, 'src', 'assets', 'env.js');
const hostEnvironmentPath = path.join('/usr/share/nginx/html/env.js');
const envPath = configPathArg ? hostEnvironmentPath : localEnvironmentPath;
const newEnvironmentContent = `window.app = '${key.toString(CryptoJS.enc.Hex)}:${encrypted}:${iv.toString(CryptoJS.enc.Hex)}'`;

fs.writeFileSync(envPath, newEnvironmentContent);
console.log('Config file encrypted successfully');
