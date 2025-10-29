const { execSync } = require('child_process');
const fs = require('fs');

function getRemoteUrl() {
  try {
    const url = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
    return url || null;
  } catch (e) {
    return null;
  }
}

function toHttpsRepo(url) {
  if (!url) return null;
  // Supports https and ssh formats
  if (url.startsWith('https://')) {
    return url.replace(/\.git$/, '');
  }
  const sshMatch = url.match(/^git@github\.com:(.+)\.git$/);
  if (sshMatch) {
    return `https://github.com/${sshMatch[1]}`;
  }
  return null;
}

function getLog() {
  const format = '%H|%ad|%s';
  const cmd = `git log --pretty=format:"${format}" --date=short`;
  try {
    return execSync(cmd, { encoding: 'utf8' });
  } catch (e) {
    console.error('Failed to read git log. Is this a git repository?');
    process.exit(1);
  }
}

function groupByDate(lines) {
  const groups = new Map();
  lines.forEach(line => {
    const [sha, date, subject] = line.split('|');
    if (!sha || !date) return;
    const arr = groups.get(date) || [];
    arr.push({ sha, subject });
    groups.set(date, arr);
  });
  // Sort dates descending
  return Array.from(groups.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

function buildMarkdown(repoHttps, grouped) {
  const now = new Date().toISOString().slice(0, 10);
  let md = `# Changelog\n\nGenerated on ${now}\n\n`;
  grouped.forEach(([date, commits]) => {
    md += `## ${date}\n\n`;
    commits.forEach(({ sha, subject }) => {
      const shortSha = sha.slice(0, 7);
      const link = repoHttps ? `${repoHttps}/commit/${sha}` : null;
      md += link ? `- ${subject} (${shortSha}) [view](${link})\n` : `- ${subject} (${shortSha})\n`;
    });
    md += '\n';
  });
  return md;
}

function main() {
  const remoteUrl = getRemoteUrl();
  const repoHttps = toHttpsRepo(remoteUrl);
  const raw = getLog();
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const grouped = groupByDate(lines);
  const md = buildMarkdown(repoHttps, grouped);
  fs.writeFileSync('CHANGELOG.md', md, 'utf8');
  console.log('CHANGELOG.md generated successfully.');
}

main();