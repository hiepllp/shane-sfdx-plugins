/* tslint:disable:no-unused-expression */

import { expect, test } from '@salesforce/command/dist/test';
import { core, SfdxCommand } from '@salesforce/command';

import fs = require('fs-extra');
import util = require('util');
import xml2js = require('xml2js');

import child_process = require('child_process');

import localFile2CV = require('../../../../lib/shared/localFile2CV');
import testutils = require('../../../helpers/testutils');

const exec = util.promisify(child_process.exec);
const testProjectName = 'testProject';

describe('shane:data:file:upload', () => {

  before(async () => {
    await exec(`rm -rf ${testProjectName}`);
    await exec(`sfdx force:project:create -n ${testProjectName}`);
    await testutils.orgCreate(testProjectName);
  });

  it('uploads a file simply', async () => {

    const results = await exec('sfdx shane:data:file:upload -f sfdx-project.json', { cwd: testProjectName });
    expect(results.stdout).to.be.a('string');
    expect(results.stdout).to.include('created file with content document id');

  });

  it('uploads a file with a name', async () => {

    const results = await exec('sfdx shane:data:file:upload -f sfdx-project.json -n "sfdx project json file"', { cwd: testProjectName });
    expect(results.stdout).to.be.a('string');
    expect(results.stdout).to.include('created file with content document id');
  });

  it('uploads a file with a name attached to a record', async () => {

    const newAcct = await exec('sfdx force:data:record:create -s Account -v "Name=Acme2" --json', { cwd: testProjectName });
    const results = await exec(`sfdx shane:data:file:upload -f sfdx-project.json -n "sfdx project json file" -p ${JSON.parse(newAcct.stdout).result.id}`, { cwd: testProjectName });
    expect(results.stdout).to.be.a('string');
    expect(results.stdout).to.include('created regular file attachment on record');
  });

  it('uploads a file with a name attached to a record in chatter', async () => {

    const newAcct = await exec('sfdx force:data:record:create -s Account -v "Name=Acme2" --json', { cwd: testProjectName });
    const results = await exec(`sfdx shane:data:file:upload -f sfdx-project.json -n "sfdx project json file" -c -p ${JSON.parse(newAcct.stdout).result.id}`, { cwd: testProjectName });
    expect(results.stdout).to.be.a('string');
    expect(results.stdout).to.include('created chatter file attachment on record');
  });

  it('fails chatter without a parentid', async () => {

    try {
      const results = await exec('sfdx shane:data:file:upload -f sfdx-project.json -n "sfdx project json file" -c --json', { cwd: testProjectName });
    } catch (err) {
      expect(err.message).to.include('you must specify a parentid for chatter attachments');
    }
  });

  after(async () => {
    await testutils.orgDelete(testProjectName);
    await exec(`rm -rf ${testProjectName}`);
  });
});
