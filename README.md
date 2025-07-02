# Salesforce Breadcrumb Navigation Component

A dynamic Lightning Web Component that provides intelligent breadcrumb navigation for Experience Cloud sites with complex object hierarchies.

## 🚀 Features

- **Dynamic Page Detection**: Automatically detects current page context from URL
- **Chained Wire Services**: Efficiently fetches related record data through Salesforce relationships
- **Smart Reactivity**: Uses `@track` and computed getters for optimal performance
- **Multi-Object Support**: Handles Account → Case File → Service Charge hierarchy
- **Experience Cloud Ready**: Works seamlessly in Salesforce Experience Cloud

## 🏗️ Architecture

### Component Structure
lwc/breadcrumbNavigation/
├── breadcrumbNavigation.js      # Main component logic
├── breadcrumbNavigation.html    # Template
└── breadcrumbNavigation.js-meta.xml # Metadata

### Data Flow
1. URL detection determines page context
2. Reactive getters trigger appropriate wire services
3. Chained wire services fetch related records
4. Dynamic breadcrumb generation based on object hierarchy

## 🔧 Technical Implementation

### Key Technologies
- **Lightning Web Components (LWC)**
- **Salesforce Wire Services**
- **JavaScript ES6+ Features**
- **Reactive Programming Patterns**

### Advanced Patterns Used
- Smart getter functions for conditional wire triggering
- Private property pattern for internal state management
- Chained data fetching through relationship traversal
- Dynamic URL generation for cross-environment compatibility

## 📖 Code Highlights

### Reactive Wire Chain
```javascript
get caseFileId() {
    if (this.currentPageName === 'Case_File__c') {
        return this.recordId;
    } else if (this._caseFileIdFromLookup) {
        return this._caseFileIdFromLookup;
    }
    return null;
}

@wire(getRecord, { recordId: '$caseFileId', fields: [CASE_FILE_NAME_FIELD, CASE_FILE_ACCOUNT_FIELD] })
wiredCaseFile({ error, data }) {
    if (data) {
        this._accountIdFromLookup = getFieldValue(data, CASE_FILE_ACCOUNT_FIELD);
        this.caseFileData = data;
    }
}
```
🎯 Learning Outcomes
    This project demonstrates proficiency in:
`
        - Salesforce Lightning Platform development
        - Complex data relationship handling
        - Reactive programming patterns
        - Component architecture design
        - Test-driven development principles
