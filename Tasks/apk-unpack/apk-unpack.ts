import tl = require('azure-pipelines-task-lib/task');
import path = require('path');
import apkUtilities = require('apk-utilities');

async function run() {
    try {
        let apkPath = tl.getPathInput('apkPath');
        let cwdPath: string | undefined = tl.getPathInput('cwdPath', false);
        let apkToolArgs: string | undefined = tl.getInput("apkToolArgs");

        let cwd: string | undefined = cwdPath
            || tl.getVariable('build.sourceDirectory')
            || tl.getVariable('build.sourcesDirectory')
            || tl.getVariable('System.DefaultWorkingDirectory');
        if (cwd == undefined) {
            throw Error("Can't get Current Working Directory");
        }
        if (!tl.exist(cwd)) {
            tl.mkdirP(cwd);
        }
        tl.cd(cwd);
        let outputPath = "apk-unpack";
        if (!tl.exist(outputPath)) {
            tl.mkdirP(outputPath);
        }
        if (apkPath != undefined) {
            let unpackedApk = await apkUtilities.unpackApk(apkPath, path.join(cwd, outputPath), apkToolArgs);
            if (unpackedApk != null && !tl.exist(unpackedApk)) {
                tl.setResult(tl.TaskResult.Failed, "Unable to unpack apk");
            }
        }

    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();
