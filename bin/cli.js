#!/usr/bin/env node

const { program } = require('commander');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');

const { trackNewReleases } = require('../index');

// 加载环境变量
dotenv.config();

program
  .name('github-release-tracker')
  .description('Track new releases from your followed or starred GitHub repositories')
  .version('1.0.0')
  .option('-t, --token <token>', 'GitHub personal access token')
  .option('-s, --starred', 'Track starred repositories (default)', true)
  .option('-f, --following', 'Track repositories from users you follow')
  .option('-d, --days <days>', 'Number of days to look back', '7')
  .option('-o, --output <path>', 'Output markdown file path', 'github-releases.md')
  .parse(process.argv);

const options = program.opts();

// 处理 token 优先级：命令行 > 环境变量
const token = options.token || process.env.GITHUB_TOKEN;

if (!token) {
  console.error(chalk.red('Error: GitHub token is required. Please provide it via --token option or GITHUB_TOKEN environment variable.'));
  process.exit(1);
}

const trackType = options.following ? 'following' : 'starred';
const days = parseInt(options.days, 10);
const outputPath = path.resolve(process.cwd(), options.output);

const spinner = ora('Fetching your GitHub data...').start();

trackNewReleases(token, trackType, days)
  .then(releaseInfo => {
    const { markdown, repoCount, releaseCount } = releaseInfo;
    fs.writeFileSync(outputPath, markdown);
    
    spinner.succeed(chalk.green(`Success! Tracked ${repoCount} repositories with ${releaseCount} new releases.`));
    console.log(chalk.blue(`Output saved to: ${outputPath}`));
  })
  .catch(error => {
    spinner.fail(chalk.red('Error occurred'));
    console.error(chalk.red(`Error details: ${error.message}`));
    process.exit(1);
  });
