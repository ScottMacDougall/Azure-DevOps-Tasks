import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs');
import path = require('path');
import ipaUtilities = require('ipa-utilities');

async function run() {
    try {
        let ipaPath = tl.getPathInput('ipaPath');
        let cwdPath: string | undefined = tl.getInput('cwdPath', false);

        let cwd: string | undefined = cwdPath
            || tl.getVariable('build.sourceDirectory')
            || tl.getVariable('build.sourcesDirectory')
            || tl.getVariable('System.DefaultWorkingDirectory');
        if (cwd == undefined) {
            throw Error("Can't find current working directory");
        }
        if (ipaPath == undefined) {
            throw Error("Can't find ipa path");
        }
        if (!tl.exist(cwd)) {
            tl.mkdirP(cwd);
        }
        tl.cd(cwd);
        let outputPath = "ipa-unpack";
        if (!tl.exist(outputPath)) {
            tl.mkdirP(outputPath);
        }
        let unpackedIpa = await ipaUtilities.unpackIpa(ipaPath, path.join(cwd, outputPath));
        if (!tl.exist(unpackedIpa)) {
            tl.setResult(tl.TaskResult.Failed, "Unable to unpack ipa");
        }

    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();
