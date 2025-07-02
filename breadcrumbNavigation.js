import { LightningElement, api, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

import ACCOUNT_NAME_FIELD from '@salesforce/schema/Account.Name';

import CASE_FILE_NAME_FIELD from '@salesforce/schema/Case_File__c.Name';
import CASE_FILE_ACCOUNT_FIELD from '@salesforce/schema/Case_File__c.Attorney_Firm_Name__c';

import SERVICE_CHARGE_NAME_FIELD from '@salesforce/schema/Service_Charge__c.Name';
import SERVICE_CHARGE_CASE_FILE_FIELD from '@salesforce/schema/Service_Charge__c.Case_File__c';

export default class BreadcrumbNavigation extends LightningElement {
    @api recordId;
    currentPageName;    // Property to store the current name of the page

    @track _caseFileIdFromLookup;
    @track _accountIdFromLookup;

    breadcrumbs = [];   // Property to store an array of crumb objects

    // Add properties to store wire data
    accountData;
    caseFileData;
    serviceChargeData;

    // TODO: Add state behavior handling - loading state, rendered state, etc

    // getters for each ID
    // chained wires > starting from bottom up (meaning service charge wire calls case file wire by assigning caseFileId, etc)
    get serviceChargeId() {
        console.log('🔍 serviceChargeId getter called');
        console.log('🔍 serviceChargeId getter: currentPageName =', this.currentPageName);
        return this.currentPageName === 'Service_Charge__c' ? this.recordId : null;
    }

    get caseFileId() {
        console.log('🔍 caseFileId getter called');
        console.log('🔍 caseFileId getter: currentPageName =', this.currentPageName);
        console.log('🔍 _caseFileIdFromLookup =', this._caseFileIdFromLookup);

        if (this.currentPageName === 'Case_File__c') {
            return this.recordId;
        } else if (this._caseFileIdFromLookup) {
            return this._caseFileIdFromLookup;
        }
        return null;
    }

    get accountId() {
        console.log('🔍 accountId getter called');
        console.log('🔍 accountId getter: currentPageName =', this.currentPageName);
        console.log('🔍 _accountIdFromLookup =', this._accountIdFromLookup);

        if (this.currentPageName === 'Account') {
            return this.recordId;
        } else if (this._accountIdFromLookup) {
            return this._accountIdFromLookup;
        }
        return null;
    }

    get siteBaseUrl() {
        return this.getSiteBaseUrl();
    }


    @wire(CurrentPageReference)
    wiredPageReference(pageRef) {
        console.log('📍 CurrentPageReference wire fired');
        console.log('📍 pageRef:', pageRef);
        this.currentPageReference = pageRef;
    
        this.initializeComponent();
    }

    @wire(getRecord, {
        recordId: '$serviceChargeId',
        fields: [SERVICE_CHARGE_NAME_FIELD, SERVICE_CHARGE_CASE_FILE_FIELD]
    })
    wiredServiceCharge({ error, data }) {
        console.log('🔗 Service Charge wire fired');
        if (data) {
            this._caseFileIdFromLookup = getFieldValue(data, SERVICE_CHARGE_CASE_FILE_FIELD);
            this.serviceChargeData = data;
            console.log('🔗 Set _caseFileIdFromLookup to:', this._caseFileIdFromLookup);
        }
        // TODO: Add error handling
    }

    @wire(getRecord, {
        recordId: '$caseFileId',
        fields: [CASE_FILE_NAME_FIELD, CASE_FILE_ACCOUNT_FIELD]
    })
    wiredCaseFile({ error, data }) {
        console.log('🔗 Case File wire fired');
        if (data) {
            this._accountIdFromLookup = getFieldValue(data, CASE_FILE_ACCOUNT_FIELD);
            this.caseFileData = data;
            console.log('🔗 Set _accountIdFromLookup to:', this._accountIdFromLookup);
        }
        // TODO: Add error handling
    }

    @wire(getRecord, {
        recordId: '$accountId',
        fields: [ACCOUNT_NAME_FIELD]
    })
    wiredAccount({ error, data }) {
        console.log('🔗 Account wire fired');
        if (data) {
            this.accountData = data;
            this.buildBreadcrumbs();    // Build the breadcrumbs
        }
        // TODO: Add error handling
    }

    
    // Function to build the breadcrumb in order
    initializeComponent() {
        console.log('🚀 COMPONENT STARTED - breadcrumbNavigation');
        console.log('🚀 recordId:', this.recordId);
        console.log('🚀 Current URL:', window.location.pathname);
        this.determinePageContext();
        // this.buildBreadcrumbs();
    }
    determinePageContext() {
        console.log('🔍 determinePageContext started');
        console.log('🔍 currentPageReference:', this.currentPageReference);
        // Determine current page name from URL
        this.currentPageName = this.detectFromURL();
        console.log('This current page:', this.currentPageName);
    }

    detectFromURL() {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/account/')) return 'Account';
        if (currentPath.includes('/case-file/')) return 'Case_File__c';
        if (currentPath.includes('/service-charge/')) return 'Service_Charge__c';
        return null;
    }

    buildBreadcrumbs() {
        console.log('🍞 buildBreadcrumbs started');
        const pageType = this.currentPageName;
        console.log('🍞 This pageType:', pageType);

        const crumbs = []; // Start fresh

        switch(pageType) {
            case 'Case_File__c':
                crumbs.push(this.createAccountBreadcrumb());
                crumbs.push(this.createCaseFilesListBreadcrumb());
                crumbs.push(this.createCaseFileBreadcrumb());
                break;
            case 'Service_Charge__c':
                crumbs.push(this.createAccountBreadcrumb());
                crumbs.push(this.createCaseFilesListBreadcrumb());
                crumbs.push(this.createCaseFileBreadcrumb());
                crumbs.push(this.createServiceChargeBreadcrumb());
                break;
            default:
        }
        
        // Filter out null values and assign
        this.breadcrumbs = crumbs.filter(crumb => crumb !== null);
        console.log('🍞 Final breadcrumbs:', this.breadcrumbs);
    }


    // Breadcrumb utility functions to build each breadcrumb trail
    // TODO: Build out the breadcrumbs
    createAccountBreadcrumb() {
        console.log('🍞 createAccountBreadcrumb started');
        console.log('!!!! This siteBaseUrl === ',  this.siteBaseUrl);

        const accountId = this._accountIdFromLookup || this.recordId;
        
        if (!accountId) return null;
        
        return {
            label: 'Account',
            name: 'account',
            href: `${this.siteBaseUrl}/account/${accountId || ''}`,
            id: accountId
        };
    }

    createCaseFilesListBreadcrumb() {
        console.log('🍞 createCaseFilesListBreadcrumb started');
        console.log('!!!! This siteBaseUrl === ',  this.siteBaseUrl);

        const accountId = this._accountIdFromLookup || this.recordId;

        if (!accountId) return null;
        
        return {
            label: 'Case Files',
            name: 'caseFiles',
            href: `${this.siteBaseUrl}/account/related/${accountId}/Case_Files1__r`,
            id: `${accountId}_case_files`
        };
    }

    createCaseFileBreadcrumb() {
        console.log('🍞 createCaseFileBreadcrumb started');
        console.log('!!!! This siteBaseUrl === ',  this.siteBaseUrl);
        
        if (!this.recordId) return null;
        
        return {
            label: 'Case File',
            name: 'caseFile',
            href: `${this.siteBaseUrl}/case-file/${this.recordId || ''}`,
            id: this.recordId
        };
    }

    createServiceChargeBreadcrumb() {
        console.log('🍞 createServiceChargeBreadcrumb started');
        console.log('!!!! This siteBaseUrl === ',  this.siteBaseUrl);
        
        if (!this.recordId) return null;
        
        return {
            label: 'Service Charge',
            name: 'serviceCharge',
            href: `${this.siteBaseUrl}/service-charge/${this.recordId || ''}`,
            id: this.recordId
        };
    }

    getSiteBaseUrl() {
        // Dynamic URL generation - handles both sandbox and production
        const currentUrl = window.location.href;
        const urlParts = currentUrl.split('/s/');
        return urlParts[0] + '/s';
    }
}