import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

let taskPath = path.join(__dirname, '..', 'ipa-update-icons.js');
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

tmr.setInput('iconSource', 'filepath');
tmr.setInput('cwdPath', __dirname);
tmr.setInput('iconPath', 'icon.png');
tmr.setInput('input_ipaPath', 'test.ipa');
let a: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
    "which": {
        "unzip": ""
    },
    "stats": {
        "icon.png": {
            "isFile": true
        },
        "test.ipa": {
            "isFile": true
        }
    }
};
tmr.setAnswers(a)
tmr.run();