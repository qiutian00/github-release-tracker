const { Octokit } = require('@octokit/rest');

class GitHubService {
  constructor(token) {
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * 获取用户 star 的仓库
   */
  async getStarredRepos() {
    try {
      console.log("正在获取 starred 仓库列表...");
      const repos = await this.retryPaginate(this.octokit.activity.listReposStarredByAuthenticatedUser);
      console.log(`成功获取 ${repos.length} 个 starred 仓库`);
      return repos.map(repo => ({
        name: repo.name,
        fullName: repo.full_name,
        url: repo.html_url,
        description: repo.description,
        owner: repo.owner.login
      }));
    } catch (error) {
      if (error.message.includes('Repository access blocked')) {
        console.error('获取仓库失败: 仓库访问被阻止,请检查 token 权限是否正确');
        throw new Error('仓库访问被阻止,请检查 token 权限');
      }
      throw error;
    }
  }

  async retryPaginate(method, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.octokit.paginate(method);
      } catch (error) {
        if (attempt === retries) throw error;
        console.log(`重试第 ${attempt} 次...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // 指数退避
      }
    }
  }

  /**
   * 获取用户关注的账号
   */
  async getFollowedUsers() {
    return await this.octokit.paginate(this.octokit.users.listFollowedByAuthenticatedUser);
  }

  /**
   * 获取特定用户的仓库
   */
  async getUserRepos(username) {
    const repos = await this.octokit.paginate(this.octokit.repos.listForUser, { username });
    return repos.map(repo => ({
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      description: repo.description,
      owner: repo.owner.login
    }));
  }

  /**
   * 获取关注用户的所有仓库
   */
  async getFollowingRepos() {
    const followedUsers = await this.getFollowedUsers();
    let allRepos = [];
    
    for (const user of followedUsers) {
      const repos = await this.getUserRepos(user.login);
      allRepos = allRepos.concat(repos);
    }
    
    return allRepos;
  }

  /**
   * 获取仓库的最近发布版本
   */
  async getRecentReleases(repoFullName, days) {
    const [owner, repo] = repoFullName.split('/');
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    try {
      const releases = await this.octokit.paginate(this.octokit.repos.listReleases, {
        owner,
        repo
      });
      
      return releases
        .filter(release => {
          const releaseDate = new Date(release.published_at);
          return releaseDate >= since;
        })
        .map(release => ({
          name: release.name,
          tagName: release.tag_name,
          url: release.html_url,
          publishedAt: release.published_at,
          body: release.body
        }));
    } catch (error) {
      if (error.status === 404) {
        return []; // 仓库没有发布版本
      }
      throw error;
    }
  }
}

module.exports = GitHubService;
