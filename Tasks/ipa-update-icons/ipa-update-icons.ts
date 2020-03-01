import tl = require('azure-pipelines-task-lib/task');
import tr = require('azure-pipelines-task-lib/toolrunner');
import fs = require('fs');
import path = require('path');
import ipaUtilities = require('ipa-utilities');

function copyFolderContentRecursiveSync(source: string, target: string) {
    var files = [];

    //copy
    if (fs.lstatSync(source).isDirectory()) {
        files = fs.readdirSync(source);
        files.forEach(function (file) {
            var curSource = path.join(source, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderContentRecursiveSync(curSource, target);
            } else {
                fs.copyFileSync(curSource, path.join(target, file));
            }
        });
    }
}

async function run() {
    try {
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        let cwdPath: string = tl.getPathInput('cwdPath', false);
        let cwd: string = cwdPath
            || tl.getVariable('build.sourceDirectory')
            || tl.getVariable('build.sourcesDirectory')
            || tl.getVariable('System.DefaultWorkingDirectory');
        if (!tl.exist(cwd)) {
            tl.mkdirP(cwd);
        }
        let outputPath = "ipa-update-icons";
        if (!tl.exist(outputPath)) {
            tl.mkdirP(outputPath);
        }
        tl.cd(cwd);
        tl.debug('cwd = ' + cwd);
        let unpackedIpaContentPath: string;
        let ipaPath = tl.getPathInput('ipaPath');
        let fromIPA = tl.getInput('sourceOrIpa') == 'ipa';
        let iconPath = tl.getPathInput('iconPath');
        let assetsFolder: string = tl.getPathInput('assetsPath');
        let appIconName: string = tl.getInput('appIconName');

        if (!tl.stats(iconPath).isFile()) {
            throw new Error(tl.loc('InvalidFilePath', iconPath));
        }
        tl.debug('iconPath = ' + iconPath);
        if (ipaPath == null && fromIPA) {
            tl.setResult(tl.TaskResult.Failed, 'No ipa file path provided');
            return;
        }

        let appIconFolder: string = assetsFolder + "/" + appIconName + ".appiconset";

        if (!fs.existsSync(appIconFolder)) {
            fs.mkdirSync(appIconFolder);
        }
        let iconGeneratorTool: tr.ToolRunner = tl.tool(tl.which("bash", true));
        let resolved = process.cwd();
        let options = <tr.IExecOptions>{
            cwd: process.cwd(),
            failOnStdErr: false,
            ignoreReturnCode: true,
        };

        iconGeneratorTool.arg(path.join(__dirname, 'ios-icon-generator.sh'));
        iconGeneratorTool.arg(iconPath);
        iconGeneratorTool.arg(appIconFolder);
        let iconGenerationResult = await iconGeneratorTool.exec(options);
        if (iconGenerationResult != 0) {
            throw new Error("Unable to generate icons");
        }
        fs.copyFileSync(path.join(__dirname, 'Contents.json'), path.join(appIconFolder, 'Contents.json'));

        if (fromIPA) {
            let acTool: tr.ToolRunner = tl.tool(tl.which("actool", true));
            let assetsOutput: string = "compiled-assets-output";
            if (!fs.existsSync(assetsOutput)) {
                fs.mkdirSync(assetsOutput);
            }
            await acTool
                .line('"'
                    + assetsFolder
                    + '"' + ' --compile "'
                    + assetsOutput
                    + '" --platform iphoneos --minimum-deployment-target 8.0 --app-icon '
                    + appIconName
                    + ' --output-partial-info-plist "'
                    + path.join(assetsOutput, "/partial.plist")
                    + '"')
                .exec();

            let ipaOutputPath = await ipaUtilities.unpackIpa(ipaPath, path.join(cwd, outputPath));
            let dirs = fs.readdirSync(path.join(ipaOutputPath, 'Payload')).filter(item => (/.*\.app$/gm).test(item));
            if (dirs.length > 0) {
                unpackedIpaContentPath = dirs[0];
            }
            else {
                throw new Error("Can't find unpacked app package");
            }
            copyFolderContentRecursiveSync(path.join(assetsOutput), path.join(ipaOutputPath, 'Payload', unpackedIpaContentPath));

            let repackedIpa = await ipaUtilities.packIpa(ipaOutputPath, path.basename(ipaPath), path.join(cwd, outputPath));

            if (!tl.exist(repackedIpa)) {
                tl.setResult(tl.TaskResult.Failed, "There was an error repackaging the ipa.");
            }
        }
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();
