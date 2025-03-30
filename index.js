const GitHubService = require('./lib/github');
const { formatToMarkdown } = require('./lib/formatter');
const { writeMarkdownFile } = require('./lib/fileWriter');

/**
 * 主函数：追踪 GitHub 仓库新发布的版本
 * @param {string} token GitHub 访问令牌
 * @param {string} trackType 要追踪的类型：'starred' 或 'following'
 * @param {number} days 查找过去几天的发布，默认为 7 天
 * @param {string} outputPath 输出 Markdown 文件路径
 */
async function trackNewReleases(token, trackType = 'starred', days = 7) {
  const github = new GitHubService(token);
  
  // 获取仓库列表
  let repos = [];
  if (trackType === 'starred') {
    repos = await github.getStarredRepos();
  } else if (trackType === 'following') {
    repos = await github.getFollowingRepos();
  } else {
    throw new Error('Invalid track type. Use "starred" or "following".');
  }
  
  // 获取每个仓库的最近发布
  const releasesByRepo = [];
  for (const [index, repo] of repos.entries()) {
    // 限制访问50个仓库
    if (index > 50) {
      break;
    }
    const releases = await github.getRecentReleases(repo.fullName, days);
    // console.log(`正在检查仓库: ${repo.fullName}`);
    // 真正检查第几个仓库
    console.log(`正在检查第 ${index + 1} 个仓库: ${repo.fullName}`);
    if (releases.length > 0) {
      console.log(` ${repo.fullName} - 发现 ${releases.length} 个新版本`);
      releasesByRepo.push({ repo, releases });
    } else {
      console.log(` ${repo.fullName} - 没有新版本发布`);
    }
  }

  // 生成 Markdown 格式
  return formatToMarkdown(releasesByRepo, days);
}

module.exports = { trackNewReleases };
