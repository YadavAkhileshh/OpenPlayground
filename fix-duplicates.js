#!/usr/bin/env node

/**
 * Duplicate Entry Fixer for projects.json
 * 
 * This script:
 * 1. Reads projects.json
 * 2. Identifies and removes duplicate entries based on title
 * 3. Validates all project entries
 * 4. Creates a backup before making changes
 * 5. Generates a detailed report
 * 
 * Usage: node fix-duplicates.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECTS_FILE = path.join(__dirname, 'projects.json');
const BACKUP_FILE = path.join(__dirname, 'projects.backup.json');
const REPORT_FILE = path.join(__dirname, 'duplicate-fix-report.md');

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

function readProjectsFile() {
    try {
        const data = fs.readFileSync(PROJECTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        log(`❌ Error reading projects.json: ${error.message}`, 'red');
        process.exit(1);
    }
}

function createBackup(projects) {
    try {
        fs.writeFileSync(BACKUP_FILE, JSON.stringify(projects, null, 2));
        log(`✅ Backup created: ${BACKUP_FILE}`, 'green');
    } catch (error) {
        log(`❌ Error creating backup: ${error.message}`, 'red');
        process.exit(1);
    }
}

function removeDuplicates(projects) {
    const seen = new Map();
    const duplicates = [];
    const cleaned = [];
    
    projects.forEach((project, index) => {
        const key = project.title?.toLowerCase().trim();
        
        if (!key) {
            log(`⚠️  Warning: Project at index ${index} has no title`, 'yellow');
            return;
        }
        
        if (seen.has(key)) {
            const original = seen.get(key);
            duplicates.push({
                title: project.title,
                originalIndex: original.index,
                duplicateIndex: index,
                link: project.link
            });
        } else {
            seen.set(key, { index: cleaned.length, project });
            cleaned.push(project);
        }
    });
    
    return { cleaned, duplicates };
}

function validateProjects(projects) {
    const issues = [];
    
    projects.forEach((project, index) => {
        // Required fields
        if (!project.title) {
            issues.push({
                index,
                type: 'missing_title',
                message: 'Project missing title'
            });
        }
        
        if (!project.link) {
            issues.push({
                index,
                type: 'missing_link',
                message: `Project "${project.title}" missing link`
            });
        }
        
        if (!project.category) {
            issues.push({
                index,
                type: 'missing_category',
                message: `Project "${project.title}" missing category`
            });
        }
        
        if (!project.description) {
            issues.push({
                index,
                type: 'missing_description',
                message: `Project "${project.title}" missing description`
            });
        }
        
        // Check for broken internal links
        if (project.link && project.link.startsWith('./projects/')) {
            const relativePath = project.link.substring(2);
            const fullPath = path.join(__dirname, relativePath);
            if (!fs.existsSync(fullPath)) {
                issues.push({
                    index,
                    type: 'broken_link',
                    message: `Project "${project.title}" has broken link: ${project.link}`
                });
            }
        }
    });
    
    return issues;
}

function generateReport(original, cleaned, duplicates, validationIssues) {
    const report = `# Projects.json Duplicate Fix Report

Generated: ${new Date().toISOString()}

## Summary

- **Original entries:** ${original.length}
- **Cleaned entries:** ${cleaned.length}
- **Duplicates removed:** ${duplicates.length}
- **Validation issues:** ${validationIssues.length}

## Duplicates Removed

${duplicates.length > 0 ? 
    duplicates.map((dup, i) => 
        `${i + 1}. **${dup.title}**
   - Original at index: ${dup.originalIndex}
   - Duplicate at index: ${dup.duplicateIndex}
   - Link: ${dup.link || 'N/A'}`
    ).join('\n\n')
    : 'No duplicates found.'
}

## Validation Issues

${validationIssues.length > 0 ?
    validationIssues.map((issue, i) =>
        `${i + 1}. **${issue.type}** (Index ${issue.index})
   - ${issue.message}`
    ).join('\n\n')
    : 'No validation issues found.'
}

## Next Steps

1. Review this report
2. Test the cleaned projects.json file
3. Fix any validation issues identified above
4. Commit changes with message: "fix: remove duplicate entries from projects.json"

## Backup

A backup of the original file was created at:
\`${BACKUP_FILE}\`

To restore: \`cp ${BACKUP_FILE} ${PROJECTS_FILE}\`
`;

    fs.writeFileSync(REPORT_FILE, report);
    log(`📄 Report generated: ${REPORT_FILE}`, 'cyan');
}

function saveCleanedProjects(projects) {
    try {
        fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
        log(`✅ Cleaned projects.json saved`, 'green');
    } catch (error) {
        log(`❌ Error saving projects.json: ${error.message}`, 'red');
        process.exit(1);
    }
}

// Main execution
function main() {
    log('\n🔧 OpenPlayground Duplicate Entry Fixer\n', 'bright');
    
    // Step 1: Read projects
    log('📖 Reading projects.json...', 'blue');
    const original = readProjectsFile();
    log(`   Found ${original.length} entries`, 'cyan');
    
    // Step 2: Create backup
    log('\n💾 Creating backup...', 'blue');
    createBackup(original);
    
    // Step 3: Remove duplicates
    log('\n🔍 Analyzing for duplicates...', 'blue');
    const { cleaned, duplicates } = removeDuplicates(original);
    
    if (duplicates.length > 0) {
        log(`   ⚠️  Found ${duplicates.length} duplicate(s)`, 'yellow');
        duplicates.slice(0, 5).forEach(dup => {
            log(`   - "${dup.title}" (indices: ${dup.originalIndex}, ${dup.duplicateIndex})`, 'yellow');
        });
        if (duplicates.length > 5) {
            log(`   ... and ${duplicates.length - 5} more`, 'yellow');
        }
    } else {
        log(`   ✅ No duplicates found`, 'green');
    }
    
    // Step 4: Validate projects
    log('\n✔️  Validating projects...', 'blue');
    const validationIssues = validateProjects(cleaned);
    
    if (validationIssues.length > 0) {
        log(`   ⚠️  Found ${validationIssues.length} validation issue(s)`, 'yellow');
        validationIssues.slice(0, 3).forEach(issue => {
            log(`   - ${issue.message}`, 'yellow');
        });
        if (validationIssues.length > 3) {
            log(`   ... and ${validationIssues.length - 3} more (see report)`, 'yellow');
        }
    } else {
        log(`   ✅ All projects valid`, 'green');
    }
    
    // Step 5: Generate report
    log('\n📊 Generating report...', 'blue');
    generateReport(original, cleaned, duplicates, validationIssues);
    
    // Step 6: Save cleaned file
    if (duplicates.length > 0) {
        log('\n💾 Saving cleaned projects.json...', 'blue');
        saveCleanedProjects(cleaned);
        
        log('\n' + '='.repeat(60), 'green');
        log('✅ SUCCESS! Projects.json has been cleaned', 'green');
        log('='.repeat(60), 'green');
        log(`\n📊 Results:`, 'bright');
        log(`   • Original entries: ${original.length}`, 'cyan');
        log(`   • Cleaned entries: ${cleaned.length}`, 'green');
        log(`   • Duplicates removed: ${duplicates.length}`, 'yellow');
        log(`\n📄 Check ${REPORT_FILE} for details`, 'cyan');
        log(`💾 Backup saved to ${BACKUP_FILE}\n`, 'cyan');
    } else {
        log('\n✅ No changes needed - projects.json is clean!\n', 'green');
    }
}

// Run the script
main();
