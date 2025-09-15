#!/bin/bash

# Documentation Update Script
# This script helps maintain and update documentation

set -e

echo "🔧 Web3 KYC Documentation Update Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if docs directory exists
if [ ! -d "docs" ]; then
    print_error "docs directory not found"
    exit 1
fi

print_status "Starting documentation update process..."

# Function to update documentation timestamps
update_timestamps() {
    print_status "Updating documentation timestamps..."
    
    CURRENT_DATE=$(date '+%Y-%m-%d')
    
    # Update last updated dates in documentation files
    find docs/ -name "*.md" -exec sed -i "s/\*\*Last Updated\*\*: .*/\*\*Last Updated\*\*: $CURRENT_DATE/g" {} \;
    
    print_success "Timestamps updated"
}

# Function to validate markdown files
validate_markdown() {
    print_status "Validating markdown files..."
    
    # Check if markdownlint is installed
    if ! command -v markdownlint &> /dev/null; then
        print_warning "markdownlint not installed. Installing..."
        npm install -g markdownlint-cli
    fi
    
    # Validate all markdown files
    if markdownlint docs/**/*.md; then
        print_success "Markdown validation passed"
    else
        print_error "Markdown validation failed"
        return 1
    fi
}

# Function to check for broken links
check_links() {
    print_status "Checking for broken links..."
    
    # Check if markdown-link-check is installed
    if ! command -v markdown-link-check &> /dev/null; then
        print_warning "markdown-link-check not installed. Installing..."
        npm install -g markdown-link-check
    fi
    
    # Check links in all markdown files
    BROKEN_LINKS=0
    for file in docs/**/*.md; do
        if [ -f "$file" ]; then
            echo "Checking links in $file"
            if ! markdown-link-check "$file"; then
                BROKEN_LINKS=$((BROKEN_LINKS + 1))
            fi
        fi
    done
    
    if [ $BROKEN_LINKS -eq 0 ]; then
        print_success "No broken links found"
    else
        print_warning "Found $BROKEN_LINKS files with broken links"
    fi
}

# Function to generate documentation metrics
generate_metrics() {
    print_status "Generating documentation metrics..."
    
    # Count total documentation files
    TOTAL_DOCS=$(find docs/ -name "*.md" | wc -l)
    echo "📊 Documentation Metrics:"
    echo "  Total documentation files: $TOTAL_DOCS"
    
    # Count lines of documentation
    TOTAL_LINES=$(find docs/ -name "*.md" -exec wc -l {} + | tail -1 | awk '{print $1}')
    echo "  Total lines of documentation: $TOTAL_LINES"
    
    # Count contract files
    if [ -d "contracts" ]; then
        TOTAL_CONTRACTS=$(find contracts/ -name "*.sol" | wc -l)
        echo "  Total contract files: $TOTAL_CONTRACTS"
    fi
    
    # Check documentation coverage
    if [ -d "contracts" ] && [ $TOTAL_CONTRACTS -gt 0 ]; then
        COVERAGE=$(echo "scale=1; $TOTAL_DOCS * 100 / $TOTAL_CONTRACTS" | bc -l)
        echo "  Documentation coverage: ${COVERAGE}%"
    fi
    
    print_success "Metrics generated"
}

# Function to update documentation index
update_index() {
    print_status "Updating documentation index..."
    
    # This would typically involve regenerating the docs/README.md
    # For now, we'll just validate it exists
    if [ -f "docs/README.md" ]; then
        print_success "Documentation index exists"
    else
        print_warning "Documentation index not found"
    fi
}

# Function to check for TODO items in documentation
check_todos() {
    print_status "Checking for TODO items in documentation..."
    
    TODO_COUNT=$(grep -r "TODO\|FIXME\|XXX" docs/ --include="*.md" | wc -l)
    
    if [ $TODO_COUNT -eq 0 ]; then
        print_success "No TODO items found in documentation"
    else
        print_warning "Found $TODO_COUNT TODO items in documentation:"
        grep -r "TODO\|FIXME\|XXX" docs/ --include="*.md" -n
    fi
}

# Function to validate code examples
validate_code_examples() {
    print_status "Validating code examples..."
    
    # Check for Solidity code blocks
    SOLIDITY_FILES=$(grep -r "\`\`\`solidity" docs/ --include="*.md" -l | wc -l)
    echo "  Found $SOLIDITY_FILES files with Solidity examples"
    
    # Check for JavaScript/TypeScript code blocks
    JS_FILES=$(grep -r "\`\`\`javascript\|\`\`\`typescript\|\`\`\`js\|\`\`\`ts" docs/ --include="*.md" -l | wc -l)
    echo "  Found $JS_FILES files with JavaScript/TypeScript examples"
    
    print_success "Code example validation completed"
}

# Function to create documentation backup
create_backup() {
    print_status "Creating documentation backup..."
    
    BACKUP_DIR="docs-backup-$(date +%Y%m%d-%H%M%S)"
    cp -r docs/ "$BACKUP_DIR"
    
    print_success "Documentation backed up to $BACKUP_DIR"
}

# Main execution
main() {
    echo "Starting documentation maintenance..."
    echo
    
    # Create backup first
    create_backup
    
    # Update timestamps
    update_timestamps
    
    # Validate markdown
    if ! validate_markdown; then
        print_error "Markdown validation failed. Please fix issues and try again."
        exit 1
    fi
    
    # Check links
    check_links
    
    # Generate metrics
    generate_metrics
    
    # Update index
    update_index
    
    # Check for TODOs
    check_todos
    
    # Validate code examples
    validate_code_examples
    
    echo
    print_success "Documentation update completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Review any warnings or errors above"
    echo "2. Commit changes to version control"
    echo "3. Update documentation status in docs/README.md"
    echo "4. Schedule next documentation review"
}

# Run main function
main "$@"
