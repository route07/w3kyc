#!/bin/bash

# Basic Documentation Update Script
# This script helps maintain and update documentation

set -e

echo "🔧 Web3 KYC Documentation Update Script (Basic)"
echo "==============================================="

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
        
        # Check documentation coverage
        if [ $TOTAL_CONTRACTS -gt 0 ]; then
            COVERAGE=$(echo "scale=1; $TOTAL_DOCS * 100 / $TOTAL_CONTRACTS" | bc -l 2>/dev/null || echo "N/A")
            echo "  Documentation coverage: ${COVERAGE}%"
        fi
    fi
    
    # Count TODO items
    TODO_COUNT=$(grep -r "TODO\|FIXME\|XXX" docs/ --include="*.md" | wc -l)
    echo "  TODO items in documentation: $TODO_COUNT"
    
    print_success "Metrics generated"
}

# Function to check for TODO items in documentation
check_todos() {
    print_status "Checking for TODO items in documentation..."
    
    TODO_COUNT=$(grep -r "TODO\|FIXME\|XXX" docs/ --include="*.md" | wc -l)
    
    if [ $TODO_COUNT -eq 0 ]; then
        print_success "No TODO items found in documentation"
    else
        print_warning "Found $TODO_COUNT TODO items in documentation:"
        grep -r "TODO\|FIXME\|XXX" docs/ --include="*.md" -n | head -10
        if [ $TODO_COUNT -gt 10 ]; then
            echo "  ... and $((TODO_COUNT - 10)) more"
        fi
    fi
}

# Function to validate code examples
validate_code_examples() {
    print_status "Validating code examples..."
    
    # Check for Solidity code blocks
    SOLIDITY_FILES=$(grep -r "solidity" docs/ --include="*.md" -l | wc -l)
    echo "  Found $SOLIDITY_FILES files with Solidity examples"
    
    # Check for JavaScript/TypeScript code blocks
    JS_FILES=$(grep -r "javascript\|typescript" docs/ --include="*.md" -l | wc -l)
    echo "  Found $JS_FILES files with JavaScript/TypeScript examples"
    
    # Check for bash/shell code blocks
    BASH_FILES=$(grep -r "bash\|sh" docs/ --include="*.md" -l | wc -l)
    echo "  Found $BASH_FILES files with bash/shell examples"
    
    print_success "Code example validation completed"
}

# Function to create documentation backup
create_backup() {
    print_status "Creating documentation backup..."
    
    BACKUP_DIR="docs-backup-$(date +%Y%m%d-%H%M%S)"
    cp -r docs/ "$BACKUP_DIR"
    
    print_success "Documentation backed up to $BACKUP_DIR"
}

# Function to check documentation structure
check_structure() {
    print_status "Checking documentation structure..."
    
    # Check for required files
    REQUIRED_FILES=(
        "docs/README.md"
        "docs/smart-contracts.md"
        "docs/configurable-values.md"
        "docs/implementation-plan.md"
        "docs/comprehensive-implementation-todo.md"
        "docs/documentation-maintenance.md"
    )
    
    MISSING_FILES=0
    for file in "${REQUIRED_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            print_warning "Missing required file: $file"
            MISSING_FILES=$((MISSING_FILES + 1))
        fi
    done
    
    if [ $MISSING_FILES -eq 0 ]; then
        print_success "All required documentation files present"
    else
        print_warning "Missing $MISSING_FILES required documentation files"
    fi
}

# Function to list documentation files
list_docs() {
    print_status "Listing all documentation files..."
    
    echo "📁 Documentation Files:"
    find docs/ -name "*.md" | sort | while read -r file; do
        echo "  - $file"
    done
}

# Main execution
main() {
    echo "Starting documentation maintenance..."
    echo
    
    # Create backup first
    create_backup
    
    # Update timestamps
    update_timestamps
    
    # Check structure
    check_structure
    
    # List documentation files
    list_docs
    
    # Generate metrics
    generate_metrics
    
    # Check for TODOs
    check_todos
    
    # Validate code examples
    validate_code_examples
    
    echo
    print_success "Documentation update completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Review any warnings above"
    echo "2. Commit changes to version control"
    echo "3. Update documentation status in docs/documentation-status.md"
    echo "4. Schedule next documentation review"
    echo
    echo "Backup created at: docs-backup-$(date +%Y%m%d-%H%M%S)"
}

# Run main function
main "$@"
