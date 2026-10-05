#!/usr/bin/env node

/**
 * GeoSync Automated Release Script
 * Automatically handles:
 * - Version bumping (SemVer auto/patch/minor/major)
 * - Conventional changelog generation in CHANGELOG.md
 * - Updating version badges and release notes in README.md and index.html
 * - Git commit, tag, push, and GitHub Release publishing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function exec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    if (err.stdout) return err.stdout.toString().trim();
    throw err;
  }
}

function getLatestTag() {
  try {
    return exec('git describe --tags --abbrev=0');
  } catch (e) {
    return 'v1.0.0';
  }
}

function parseSemver(vStr) {
  const clean = vStr.replace(/^v/, '');
  const parts = clean.split('.').map(Number);
  return {
    major: parts[0] || 1,
    minor: parts[1] || 0,
    patch: parts[2] || 0
  };
}

function bumpVersion(current, type) {
  const v = parseSemver(current);
  if (type === 'major') {
    v.major += 1;
    v.minor = 0;
    v.patch = 0;
  } else if (type === 'minor') {
    v.minor += 1;
    v.patch = 0;
  } else {
    v.patch += 1;
  }
  return `${v.major}.${v.minor}.${v.patch}`;
}

function run() {
  const bumpTypeArg = process.argv[2] || 'auto';
  console.log(`[GeoSync Release] Determining release strategy (${bumpTypeArg})...`);

  const rootDir = path.resolve(__dirname, '..');
  const packageJsonPath = path.join(rootDir, 'package.json');
  const changelogPath = path.join(rootDir, 'CHANGELOG.md');
  const readmePath = path.join(rootDir, 'README.md');
  const indexHtmlPath = path.join(rootDir, 'index.html');

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const currentTag = getLatestTag();
  console.log(`[GeoSync Release] Current tag: ${currentTag} (package.json: v${pkg.version})`);

  // Get commits since last tag
  let rawCommits = '';
  try {
    rawCommits = exec(`git log ${currentTag}..HEAD --pretty=format:"%s|%h|%an"`);
  } catch (e) {
    rawCommits = '';
  }

  const commits = rawCommits
    ? rawCommits.split('\n').filter(Boolean).map(line => {
        const [subject, hash, author] = line.split('|');
        return { subject, hash, author };
      }).filter(c => !c.subject.includes('[skip ci]'))
    : [];

  let determinedType = bumpTypeArg;
  if (bumpTypeArg === 'auto') {
    if (commits.length === 0) {
      console.log('[GeoSync Release] No new commits detected since last tag. Creating patch release.');
      determinedType = 'patch';
    } else {
      let isMajor = false;
      let isMinor = false;
      for (const c of commits) {
        const s = c.subject.toLowerCase();
        if (s.includes('breaking change') || s.startsWith('feat!:') || s.startsWith('fix!:')) {
          isMajor = true;
          break;
        }
        if (s.startsWith('feat:') || s.startsWith('feature:')) {
          isMinor = true;
        }
      }
      determinedType = isMajor ? 'major' : isMinor ? 'minor' : 'patch';
    }
  }

  const nextVersion = bumpVersion(pkg.version, determinedType);
  const nextTag = `v${nextVersion}`;
  const today = new Date().toISOString().split('T')[0];

  console.log(`[GeoSync Release] Next version: ${nextTag} (${determinedType} bump)`);

  // Group commits for changelog
  const features = [];
  const bugfixes = [];
  const maintenance = [];

  commits.forEach(c => {
    const s = c.subject;
    const lower = s.toLowerCase();
    const item = `- ${s} (\`${c.hash}\` by ${c.author})`;
    if (lower.startsWith('feat:') || lower.startsWith('feature:')) {
      features.push(item);
    } else if (lower.startsWith('fix:') || lower.startsWith('bug:')) {
      bugfixes.push(item);
    } else {
      maintenance.push(item);
    }
  });

  // Construct release notes
  let releaseNotes = `## [${nextVersion}] - ${today}\n\n`;
  if (features.length > 0) {
    releaseNotes += `### 🚀 Features\n${features.join('\n')}\n\n`;
  }
  if (bugfixes.length > 0) {
    releaseNotes += `### 🐛 Bug Fixes\n${bugfixes.join('\n')}\n\n`;
  }
  if (maintenance.length > 0) {
    releaseNotes += `### 🔧 Maintenance & Improvements\n${maintenance.join('\n')}\n\n`;
  }
  if (features.length === 0 && bugfixes.length === 0 && maintenance.length === 0) {
    releaseNotes += `### 📦 Maintenance Release\n- Routine performance updates and dependency maintenance.\n\n`;
  }

  // 1. Update package.json
  pkg.version = nextVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`[GeoSync Release] Updated package.json to version ${nextVersion}`);

  // 2. Update CHANGELOG.md
  if (fs.existsSync(changelogPath)) {
    let changelogContent = fs.readFileSync(changelogPath, 'utf8');
    const marker = '<!-- RELEASE_LOG_START -->';
    if (changelogContent.includes(marker)) {
      changelogContent = changelogContent.replace(
        marker,
        `${marker}\n\n${releaseNotes.trim()}`
      );
    } else {
      changelogContent = `# Changelog\n\n${releaseNotes}${changelogContent}`;
    }
    fs.writeFileSync(changelogPath, changelogContent);
    console.log(`[GeoSync Release] Prepend release notes to CHANGELOG.md`);
  }

  // 3. Update README.md
  if (fs.existsSync(readmePath)) {
    let readmeContent = fs.readFileSync(readmePath, 'utf8');
    // Update or add badge
    const badgeTag = `![Version](https://img.shields.io/badge/version-${nextTag}-blue.svg)`;
    if (readmeContent.includes('https://img.shields.io/badge/version-')) {
      readmeContent = readmeContent.replace(/!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-[^)]+\)/, badgeTag);
    } else {
      readmeContent = readmeContent.replace('# GeoSync — Real-Time Coordinate Tracker & Plotter\n', `# GeoSync — Real-Time Coordinate Tracker & Plotter\n\n${badgeTag}\n`);
    }

    // Update Latest Release section in README
    const releaseSectionHeader = '## 📦 Latest Release';
    const releaseSectionContent = `${releaseSectionHeader}\n* **Version:** [${nextTag}](https://github.com/fied1k/geosync-tracker/releases/tag/${nextTag}) (${today})\n* **Changelog:** See [CHANGELOG.md](CHANGELOG.md) for full history.\n\n`;
    if (readmeContent.includes(releaseSectionHeader)) {
      readmeContent = readmeContent.replace(/## 📦 Latest Release[\s\S]*?(?=\n## |$)/, releaseSectionContent.trim() + '\n\n');
    } else {
      readmeContent += `\n${releaseSectionContent}`;
    }

    fs.writeFileSync(readmePath, readmeContent);
    console.log(`[GeoSync Release] Updated README.md with ${nextTag} badge & release notes`);
  }

  // 4. Update index.html version display
  if (fs.existsSync(indexHtmlPath)) {
    let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
    htmlContent = htmlContent.replace(/v\d+\.\d+\.\d+/g, nextTag);
    fs.writeFileSync(indexHtmlPath, htmlContent);
    console.log(`[GeoSync Release] Updated index.html version tag to ${nextTag}`);
  }

  // 5. Git Commit, Tag, Push, and GitHub Release
  try {
    exec('git add package.json CHANGELOG.md README.md index.html');
    exec(`git commit -m "chore(release): ${nextTag} [skip ci]"`);
    exec(`git tag -a ${nextTag} -m "Release ${nextTag}"`);
    console.log(`[GeoSync Release] Committed and tagged ${nextTag}`);

    // Push commit and tag
    exec('git push origin main --follow-tags');
    console.log('[GeoSync Release] Pushed changes and tags to origin main');

    // Create GitHub Release via gh CLI if available
    try {
      const cleanNotes = releaseNotes.replace(/## \[[^\]]+\] - [^\n]+\n\n/, '');
      const tempNotesPath = path.join(rootDir, '.release_temp_notes.md');
      fs.writeFileSync(tempNotesPath, cleanNotes);
      exec(`gh release create ${nextTag} --title "${nextTag}" --notes-file "${tempNotesPath}"`);
      fs.unlinkSync(tempNotesPath);
      console.log(`[GeoSync Release] GitHub release published: https://github.com/fied1k/geosync-tracker/releases/tag/${nextTag}`);
    } catch (ghErr) {
      console.warn('[GeoSync Release] Note: GitHub CLI release creation skipped or not authorized in this environment.');
    }
  } catch (gitErr) {
    console.error('[GeoSync Release] Git execution warning:', gitErr.message);
  }

  console.log(`[GeoSync Release] Successfully completed release ${nextTag}! 🎉`);
}

run();
