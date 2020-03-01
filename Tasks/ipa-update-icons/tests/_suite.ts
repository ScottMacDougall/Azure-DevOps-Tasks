import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';

describe('Sample task tests', function () {

    before(function () {

    });

    after(() => {

    });

    it('should succeed with simple inputs', function (done: MochaDone) {
        this.timeout(1000);

        let tp = path.join(__dirname, 'success.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();
        console.log(tr.succeeded);
        assert.equal(tr.warningIssues.length, 0, "should have no warnings");
        assert.equal(tr.errorIssues.length, 0, "should have no errors " + tr.errorIssues[0]);

        assert.equal(tr.succeeded, true, 'should have succeeded');

        done();
    });
});