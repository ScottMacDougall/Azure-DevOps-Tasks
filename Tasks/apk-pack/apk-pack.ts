import tl = require('azure-pipelines-task-lib/task');
import apkUtilities = require('apk-utilities');
import tr = require('azure-pipelines-task-lib/toolrunner');
import path = require('path');

async function run() {
    try {
        let pack = tl.getInput("packOrUnpack", true) == "pack";
        let apkPath: string | undefined = tl.getPathInput('apkPath');
        let unpackedApkPath: string | undefined = tl.getPathInput('unpackedApkPath');
        let cwdPath: string | undefined = tl.getPathInput('cwdPath');
        let apkName = tl.getInput('apkName');
        let apkToolArgs: string | undefined = tl.getInput("apkToolArgs");
        if (pack) {
            let updatedApkFile = await packApk(cwdPath, unpackedApkPath, apkName, apkToolArgs);

            if (!tl.exist(updatedApkFile)) {
                tl.setResult(tl.TaskResult.Failed, "There was an error packaging the apk file");
            }
        } else {
            let unpackedApk = await unpackApk(cwdPath, apkPath, apkToolArgs);
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
async function unpackApk(cwdPath: string | undefined, unpackedApkPath: string | undefined, apkToolArgs: string | undefined) {
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
    if (unpackedApkPath != undefined) {
        let unpackedApk = await apkUtilities.unpackApk(unpackedApkPath, path.join(cwd, outputPath), apkToolArgs);
        return unpackedApk;
    }
}

async function packApk(cwdPath: string | undefined, apkPath: string | undefined, apkName: string | undefined, apkToolArgs: string | undefined) {
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
    return updatedApkFile;
}

