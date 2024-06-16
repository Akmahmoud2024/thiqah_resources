const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'dist'); // Adjust the path as necessary

function obfuscateFile(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const obfuscationResult = JavaScriptObfuscator.obfuscate(fileContent, {
        rotateStringArray: true
    });

    fs.writeFileSync(filePath, obfuscationResult.getObfuscatedCode());
    console.log(`Obfuscated: ${filePath}`);
}

function walkSync(dir, filelist = []) {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        filelist = fs.statSync(filePath).isDirectory()
            ? walkSync(filePath, filelist)
            : filelist.concat(filePath);
    });
    return filelist;
}

const jsFiles = walkSync(buildDir).filter(file => file.endsWith('.js'));

jsFiles.forEach(obfuscateFile);
