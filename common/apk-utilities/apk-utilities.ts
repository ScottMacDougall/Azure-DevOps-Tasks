import tl = require('azure-pipelines-task-lib/task');
import tr = require('azure-pipelines-task-lib/toolrunner');
import path = require('path');

export async function unpackApk(apkPath: string, outputPath: string, apkToolArgs: string | undefined) {
    // Find the absolute apk file path
    let apkOutputPath: string = path.join(outputPath, "output");
    // if (!tl.exist(apkOutputPath)) {
    //     tl.mkdirP(apkOutputPath);
    // }
    let bash: tr.ToolRunner = tl.tool(tl.which("java", true));
    let options = <tr.IExecOptions>{
        cwd: __dirname,
        failOnStdErr: false,
        ignoreReturnCode: true,
    };

    let apktool = "apktool.jar";
    bash.arg("-jar");
    bash.arg(path.join(__dirname, apktool));
    bash.argIf(apkToolArgs != undefined, apkToolArgs);
    bash.arg("d");
    bash.arg(apkPath);
    bash.arg("-o");
    bash.arg(apkOutputPath);
    let unpackResult = await bash.exec(options);
    if (unpackResult != 0) {
        throw new Error("Unable to unpack apk");
    }

    tl.setVariable('UNPACKED_APK_PATH', apkOutputPath);
    console.log("UNPACKED_APK_PATH: " + tl.getVariable('UNPACKED_APK_PATH'));

    tl.setVariable('UNPACKED_APK_NAME', path.basename(apkPath));
    console.log("UNPACKED_APK_NAME: " + tl.getVariable('UNPACKED_APK_NAME'));

    return apkOutputPath;

}

export async function packApk(apkPath: string, apkName: string, outputPath: string, apkToolArgs: string | undefined) {
    let apkRepackOutputPath = path.join(outputPath, "output");
    let bash: tr.ToolRunner = tl.tool(tl.which("java", true));
    let options = <tr.IExecOptions>{
        cwd: __dirname,
        failOnStdErr: false,
        ignoreReturnCode: true,
    };
    let updatedApkFile = path.join(outputPath, apkName);

    let apktool = "apktool.jar";
    bash.arg("-jar");
    bash.arg(path.join(__dirname, apktool));
    bash.argIf(apkToolArgs != undefined, apkToolArgs);
    bash.arg("b");
    bash.arg(apkPath);
    bash.arg("-o");
    bash.arg(updatedApkFile);
    let packResult = await bash.exec(options);
    if (packResult != 0) {
        throw new Error("Unable to pack apk");
    }
    tl.setVariable('REPACKAGED_APK_FILE', updatedApkFile);
    console.log("REPACKAGED_APK_FILE: " + tl.getVariable('REPACKAGED_APK_FILE'));

    return updatedApkFile;
}

export function findMatchExactlyOne(defaultRoot: string, pattern: string): string {
    let files: Array<string> = tl.findMatch(defaultRoot, pattern);

    if (!files || files.length === 0) {
        throw new Error(tl.loc('NoMatchingFileWithSearchPattern', pattern));
    }

    if (files.length > 1) {
        throw new Error(tl.loc('MultipleFilesFound', pattern));
    }

    return files[0];
}
