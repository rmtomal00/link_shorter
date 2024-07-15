const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

class EJSfileRenderer {
    constructor(){}

    getEjsToHtml(data, filename, foldername){
        try {
            const templatePath = path.join(__dirname, foldername, filename);
            const template = fs.readFileSync(templatePath, 'utf-8');
            const htmlContent = ejs.render(template, data);
            return htmlContent;
        } catch (error) {
            console.log(error);
            return null
        }
    }
}

module.exports = EJSfileRenderer;