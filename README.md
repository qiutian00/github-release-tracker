# GitHub Release Tracker

A command-line tool to track and summarize new releases from your starred repositories or repositories of users you follow on GitHub.

## Installation

```bash
# Install globally
npm install -g github-release-tracker

# Or install locally
npm install github-release-tracker

## Usage

```bash
# Using CLI with a token
github-release-tracker --token YOUR_GITHUB_TOKEN

# Track repositories from users you follow instead of starred repos
github-release-tracker --token YOUR_GITHUB_TOKEN --following

# Set a different time period (default is 7 days)
github-release-tracker --token YOUR_GITHUB_TOKEN --days 14

# Specify a custom output file path
github-release-tracker --token YOUR_GITHUB_TOKEN --output releases.md

```

### Programmatic Usage

```js
const { trackNewReleases } = require('github-release-tracker');

// Track starred repositories
trackNewReleases('your-github-token', 'starred', 7)
  .then(result => {
    console.log(`Found ${result.releaseCount} releases from ${result.repoCount} repositories`);
    console.log(result.markdown);
  })
  .catch(console.error);

// Track repositories from users you follow
trackNewReleases('your-github-token', 'following', 7)
  .then(result => {
    console.log(`Found ${result.releaseCount} releases from ${result.repoCount} repositories`);
    console.log(result.markdown);
  })
  .catch(console.error);

```

### Required GitHub Permissions

You need to create a GitHub token with the following scopes:

>**repo - For access to private repositories (if needed)**
>**user:follow - For access to users you follow**