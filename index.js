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
  for (const repo of repos) {
    const releases = await github.getRecentReleases(repo.fullName, days);
    if (releases.length > 0) {
      releasesByRepo.push({ repo, releases });
    }
  }

  // 生成 Markdown 格式
  return formatToMarkdown(releasesByRepo, days);
}

module.exports = { trackNewReleases };
