import tl = require('azure-pipelines-task-lib/task');
import apkUtilities = require('apk-utilities');
import tr = require('azure-pipelines-task-lib/toolrunner');
import path = require('path');

async function run() {
    try {
        let apkPath: string | undefined = tl.getPathInput('apkPath', true);
        let cwdPath: string | undefined = tl.getPathInput('cwdPath', false);
        let apkName = tl.getInput('apkName', true);
        let apkToolArgs: string | undefined = tl.getInput("apkToolArgs");

        let cwd: string | undefined = cwdPath
            || tl.getVariable('build.sourceDirectory')
            || tl.getVariable('build.sourcesDirectory')
            || tl.getVariable('System.DefaultWorkingDirectory');

        if (apkPath == undefined) {
            throw Error("apk path required");
        }
        if (apkName == undefined) {
            throw Error("apk name required");
        }
        if (cwd == undefined) {
            throw Error("cwdPath required");
        }

        if (!tl.exist(cwd)) {
            tl.mkdirP(cwd);
        }
        tl.cd(cwd);
        let outputPath = "apk-pack";
        if (!tl.exist(outputPath)) {
            tl.mkdirP(outputPath);
        }
        if (!apkName.toLowerCase().endsWith('.apk')) {
            apkName += '.apk';
        }
        let updatedApkFile = await apkUtilities.packApk(apkPath, apkName, path.join(cwd, outputPath), apkToolArgs);
        if (!tl.exist(updatedApkFile)) {
            tl.setResult(tl.TaskResult.Failed, "There was an error packaging the apk file");
        }
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();
