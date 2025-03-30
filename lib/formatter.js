/**
 * 将发布信息格式化为 Markdown 文档
 */
function formatToMarkdown(releasesByRepo, days) {
  const date = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  let markdown = `# GitHub Releases Summary\n\n`;
  markdown += `> Generated on ${date.toISOString().split('T')[0]}\n`;
  markdown += `> Showing releases from ${startDate.toISOString().split('T')[0]} to ${date.toISOString().split('T')[0]}\n\n`;
  
  let repoCount = 0;
  let totalReleaseCount = 0;

  if (releasesByRepo.length === 0) {
    markdown += `No new releases found in the past ${days} days.\n`;
    return { markdown, repoCount: 0, releaseCount: 0 };
  }

  // 按日期排序仓库 (最近的在前)
  releasesByRepo.sort((a, b) => {
    const latestA = new Date(a.releases[0].publishedAt);
    const latestB = new Date(b.releases[0].publishedAt);
    return latestB - latestA;
  });

  for (const repoReleases of releasesByRepo) {
    const { repo, releases } = repoReleases;
    
    if (releases.length === 0) continue;
    
    repoCount++;
    totalReleaseCount += releases.length;
    
    markdown += `## [${repo.fullName}](${repo.url})\n\n`;
    
    if (repo.description) {
      markdown += `> ${repo.description}\n\n`;
    }
    
    for (const release of releases) {
      const releaseDate = new Date(release.publishedAt).toISOString().split('T')[0];
      
      markdown += `### [${release.tagName}](${release.url}) (${releaseDate})\n\n`;
      
      if (release.name && release.name !== release.tagName) {
        markdown += `**${release.name}**\n\n`;
      }
      
      if (release.body) {
        // 处理 Markdown 内容缩进
        const body = release.body
          .split('\n')
          .map(line => line.trim())
          .join('\n');
          
        markdown += `${body}\n\n`;
      }
      
      markdown += `---\n\n`;
    }
  }

  markdown += `\n\n*Found ${totalReleaseCount} releases from ${repoCount} repositories in the past ${days} days.*`;

  return { markdown, repoCount, releaseCount: totalReleaseCount };
}

module.exports = { formatToMarkdown };
