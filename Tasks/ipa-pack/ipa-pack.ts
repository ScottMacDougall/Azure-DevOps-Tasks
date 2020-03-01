import tl = require('azure-pipelines-task-lib/task');
import ipaUtilities = require('ipa-utilities');
import tr = require('azure-pipelines-task-lib/toolrunner');
import path = require('path');

async function run() {
    try {
        let ipaPath = tl.getPathInput('ipaPath');
        let ipaName = tl.getInput('ipaName');
        let cwdPath: string = tl.getInput('cwdPath', false);

        let cwd: string = cwdPath
            || tl.getVariable('build.sourceDirectory')
            || tl.getVariable('build.sourcesDirectory')
            || tl.getVariable('System.DefaultWorkingDirectory');

        if (!tl.exist(cwd)) {
            tl.mkdirP(cwd);
        }
        tl.cd(cwd);
        let outputPath = "ipa-pack";
        if (!tl.exist(outputPath)) {
            tl.mkdirP(outputPath);
        }
        if (!ipaName.toLowerCase().endsWith('.ipa')) {
            ipaName += '.ipa';
        }
        let updatedIpaFile = await ipaUtilities.packIpa(ipaPath, ipaName, path.join(cwd, outputPath));
        if (!tl.exist(updatedIpaFile)) {
            tl.setResult(tl.TaskResult.Failed, "There was an error packaging the ipa file");
        }
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();
