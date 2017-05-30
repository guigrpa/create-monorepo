#!/usr/bin/env node

/* eslint-disable no-console */

import 'babel-polyfill';
import fs from 'fs';
import inquirer from 'inquirer';
import chalk from 'chalk';
import shell from 'shelljs';

const OAO_DOCS = 'https://github.com/guigrpa/oao';

const start = async () => {
  try {
    const { monorepoName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'monorepoName',
        message: 'Please write a name for the monorepo (e.g. my-awesome-idea)',
      },
    ]);
    if (!monorepoName) return;
    log(`Creating monorepo directory ${chalk.yellow.bold(monorepoName)}...`);
    shell.mkdir(monorepoName);
    log(`Creating ${chalk.yellow.bold('package.json')}...`);
    const monorepoPkg = getPkgJsonForRoot(monorepoName);
    fs.writeFileSync(
      `${monorepoName}/package.json`,
      JSON.stringify(monorepoPkg, null, 2),
      'utf8'
    );
    log(`Adding ${chalk.yellow.bold('oao')} tool...`);
    await exec('yarn add oao --dev', { cwd: monorepoName });
    log(`Creating subpackage ${chalk.yellow.bold(monorepoName)}...`);
    const subpackageDir = `${monorepoName}/packages/${monorepoName}`;
    shell.mkdir('-p', subpackageDir);
    const subPkg = getPkgJsonForSubpackage(monorepoName);
    fs.writeFileSync(
      `${subpackageDir}/package.json`,
      JSON.stringify(subPkg, null, 2),
      'utf8'
    );
    log(
      `Your monorepo ${chalk.yellow.bold(monorepoName)} is now ready. Enjoy hacking!`
    );
    log(`You can find the Oao docs here: ${chalk.magenta.bold(OAO_DOCS)}`);
  } catch (err) {
    console.error(
      chalk.red.bold('Could not complete monorepo creation (see error above)')
    );
    process.exit(1);
  }
};

const exec = (cmd, options) =>
  new Promise((resolve, reject) => {
    shell.exec(cmd, options, (code, stdout, stderr) => {
      if (code !== 0) {
        if (options.silent) {
          console.log(stdout);
          console.error(stderr);
        }
        reject();
      }
      resolve();
    });
  });

const getPkgJsonForRoot = name => ({
  name,
  version: '1.0.0',
  private: true,
  scripts: {
    status: 'oao status',
    bootstrap: 'oao bootstrap',
    prepareRelease: 'oao prepublish',
    release: 'oao publish',
  },
  license: 'MIT',
});

const getPkgJsonForSubpackage = name => ({
  name,
  version: '1.0.0',
  main: 'index.js',
  license: 'MIT',
});

const log = msg => {
  console.log(`\n${chalk.yellow.bold('> ')}${msg}`);
};

start();
