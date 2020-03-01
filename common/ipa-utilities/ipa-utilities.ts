import tl = require('azure-pipelines-task-lib/task');
import tr = require('azure-pipelines-task-lib/toolrunner');
import path = require('path');

export async function unpackIpa(ipaPath: string, outputPath: string) {

    let ipaOutputPath: string = path.join(outputPath, "output");
    if (!tl.exist(ipaOutputPath)) {
        tl.mkdirP(ipaOutputPath);
    }
    let unzip: tr.ToolRunner = tl.tool(tl.which('unzip', true));
    unzip.arg("-o");
    unzip.arg(ipaPath);
    unzip.arg("-d");
    unzip.arg(ipaOutputPath);
    unzip.execSync();

    tl.setVariable('UNPACKED_IPA_PATH', ipaOutputPath);
    console.log("UNPACKED_IPA_PATH: " + tl.getVariable('UNPACKED_IPA_PATH'));

    tl.setVariable('UNPACKED_IPA_NAME', path.basename(ipaPath));
    console.log("UNPACKED_IPA_NAME: " + tl.getVariable('UNPACKED_IPA_NAME'));

    return ipaOutputPath;
}

export async function packIpa(ipaPath: string, ipaName: string, outputPath: string) {
    let zip: tr.ToolRunner = tl.tool(tl.which('zip', true));
    tl.cd(ipaPath);
    zip.arg("-r");
    zip.arg("-X");
    zip.arg(ipaName);
    zip.arg('Payload');
    zip.execSync();

    let ipaRepackOutputPath = path.join(outputPath, "output");
    if (!tl.exist(ipaRepackOutputPath)) {
        tl.mkdirP(ipaRepackOutputPath);
    }
    tl.mv(path.join(ipaPath, ipaName), ipaRepackOutputPath, "-f");

    let updatedIpaFile = path.join(ipaRepackOutputPath, ipaName);

    tl.setVariable('REPACKAGED_IPA_FILE', updatedIpaFile);
    console.log("REPACKAGED_IPA_FILE: " + tl.getVariable('REPACKAGED_IPA_FILE'));

    return updatedIpaFile;
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
