#!/usr/bin/env node

const fs        = require('fs');
const program   = require('commander')
const inquirer  = require('inquirer')
const chalk     = require('chalk')
const axios     = require('axios')
const _         = require('lodash')

// issues 個數，目前全手動預設
const per_page = 100;

program
  .command('reviews').alias('r')
  .description('複習 Github issues')
  .option('--name [reviewIssues]')
  .action(option => {
    let config = _.assign({
      reviewIssues: null,
    }, option)

    let prompts = [];

    if (!config.reviewIssues) {
      prompts.push(
        {
          type: 'confirm',
          name: 'updateIssues',
          message: '是否要更新 issues?',
        },
        {
          type: 'input',
          name: 'displayIssueNums',
          message: '是否要列出所有 issues?, 或是輸入你要的個數（從最新開始）',
          default: per_page,
        }
      );
    }

    inquirer.prompt(prompts).then(function (answers) {
      if (answers.updateIssues === true) {
        axios.get(`https://api.github.com/repos/Shenglian/WORK_TIP/issues?per_page=${per_page}`)
        .then(response => {
          fs.writeFile(`${__dirname}/issues.json`, JSON.stringify(response.data), function (err) {
            issuesList({
              'num': answers.displayIssueNums
            });
          });
        })
        .catch(function (error) {
          console.log(error);
        });
      } else {
        issuesList({
          'num': answers.displayIssueNums
        });
      }
    })
  })

program.parse(process.argv)

function issuesList({num = per_page}) {
  try {
    const objs = JSON.parse(fs.readFileSync(`${__dirname}/issues.json`, 'utf8'));
    objs
      .splice(0, num)
      .map(obj => {
        console.log(`${obj.title} - ${obj.html_url}`);
      })

  } catch(error) {
    console.log(`maybe loss issues.json, check/load issues.json, plz`);
  }
}
