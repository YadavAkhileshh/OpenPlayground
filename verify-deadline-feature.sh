#!/bin/bash
# Quick Setup Verification Script for Deadline Feature
# This script checks that all necessary files for the deadline feature are in place

echo "🔍 Verifying Project Deadline Feature Setup..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for required files
files_to_check=(
    "js/projectDeadlineManager.js"
    "js/deadlineUI.js"
    "css/deadline.css"
    "components/projects.html"
)

echo "Checking required files:"
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file (MISSING)"
    fi
done

echo ""
echo "Checking for imports in key files:"

# Check if app.js imports the deadline modules
if grep -q "import.*deadlineManager" js/app.js; then
    echo -e "${GREEN}✓${NC} projectDeadlineManager imported in app.js"
else
    echo -e "${RED}✗${NC} projectDeadlineManager NOT imported in app.js"
fi

if grep -q "import.*deadlineUI" js/app.js; then
    echo -e "${GREEN}✓${NC} deadlineUI imported in app.js"
else
    echo -e "${RED}✗${NC} deadlineUI NOT imported in app.js"
fi

# Check if cardRenderer imports deadline manager
if grep -q "import.*deadlineManager" js/cardRenderer.js; then
    echo -e "${GREEN}✓${NC} projectDeadlineManager imported in cardRenderer.js"
else
    echo -e "${RED}✗${NC} projectDeadlineManager NOT imported in cardRenderer.js"
fi

# Check if CSS is linked in index.html
if grep -q "deadline.css" index.html; then
    echo -e "${GREEN}✓${NC} deadline.css linked in index.html"
else
    echo -e "${RED}✗${NC} deadline.css NOT linked in index.html"
fi

# Check if modal placeholder exists
if grep -q "deadline-modal-placeholder" index.html; then
    echo -e "${GREEN}✓${NC} deadline-modal-placeholder exists in index.html"
else
    echo -e "${RED}✗${NC} deadline-modal-placeholder NOT found in index.html"
fi

# Check for sort options
if grep -q "By Deadline" components/projects.html; then
    echo -e "${GREEN}✓${NC} 'By Deadline' sort option found"
else
    echo -e "${RED}✗${NC} 'By Deadline' sort option NOT found"
fi

if grep -q "By Importance" components/projects.html; then
    echo -e "${GREEN}✓${NC} 'By Importance' sort option found"
else
    echo -e "${RED}✗${NC} 'By Importance' sort option NOT found"
fi

echo ""
echo "Feature Setup Verification Complete!"
echo ""
echo -e "${YELLOW}Usage Instructions:${NC}"
echo "1. Open the website in a browser"
echo "2. Navigate to the Projects section"
echo "3. Click the calendar icon on any project card"
echo "4. Set a deadline and importance level"
echo "5. Use 'By Deadline' or 'By Importance' sort options to organize projects"
echo ""
echo "For more information, see: DEADLINE_FEATURE_GUIDE.md"
