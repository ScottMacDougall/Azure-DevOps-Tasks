import tl = require('azure-pipelines-task-lib/task');
import tr = require('azure-pipelines-task-lib/toolrunner');
import path = require('path');

import http = require('https');
import fs = require('fs');

export async function unpackApk(apkPath: string, outputPath: string, apkToolArgs: string | undefined) {
    let apkOutputPath: string = path.join(outputPath, "output");
    let bash: tr.ToolRunner = tl.tool(tl.which("java", true));
    let options = <tr.IExecOptions>{
        cwd: __dirname,
        failOnStdErr: false,
        ignoreReturnCode: true,
    };

    let apktoolPath = path.join(__dirname, "apktool.jar");
    download("https://bitbucket.org/iBotPeaches/apktool/downloads/apktool_2.4.1.jar", apktoolPath, async function () {
        bash.arg("-jar");
        bash.arg(apktoolPath);
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
    });

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
    let apktoolPath = path.join(__dirname, "apktool.jar");
    download("https://bitbucket.org/iBotPeaches/apktool/downloads/apktool_2.4.1.jar", apktoolPath, async function () {
        bash.arg("-jar");
        bash.arg(apktoolPath);
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
    });
}

export function download(url: string, dest: string, callback: Function) {
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function (response) {
        if (response.statusCode == 302 && response.headers.location) {
            download(response.headers.location, dest, callback);
        } else {
            response.pipe(file).on("finish", callback());
        };
    }).on('error', function (err) {
        throw Error("Unable to download Apktool");
    });
};
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
