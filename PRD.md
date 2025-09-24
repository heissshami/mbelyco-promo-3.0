📘 Product Requirement Document (PRD)

📌 Product Name (Working Title):
MBELYCO Promo 2.0

🎯 Objective
**Objective:** To build a comprehensive and secure promotional code management system that automates the entire lifecycle of promo codes, from generation to redemption, while providing robust administrative and security features.

### Core Workflow
1. **Batch Creation**: Administrators create Promo Codes Batch with configurable parameters

2. **Code Generation**: System generates unique, secure promo codes in batches using timestamp-based algorithms

3. **Redemption**: Authorized User will verify and Redeem valid and active Promo Code.

4. **Fraud Reporting**: Reported Redeemed Promo Codes as fraudulent and take necessary actions.


🌟 Core Features

### 1. Authentication & Authorization

#### Feature Description:
- Implements a comprehensive role-based access control (RBAC) system with granular permissions for every feature and operation. This ensures that users can only access the functionalities for which they are authorized, enhancing the overall security of the system.
- The authorization is enforced through a `withAuth` middleware function that takes an array of required permissions.
- The system uses a granular permission system for different user roles.
- All permission-based actions are logged for auditing purposes.

#### User Story/Use Case:
- As a system administrator, I want to implement role-based access control with granular permissions, so that I can ensure only authorized users can access specific system functions and maintain security.

#### Scope:
- Role-based access control (RBAC) system.
- Granular permission management.
- Session management with secure tokens.
- Permission-based middleware for API protection.
- User role assignment and management.
- User Profile with capabilities to change password.

#### Out of Scope:
- Single sign-on (SSO) integration.
- Advanced biometric authentication.
- Integration with external identity providers.
- Automated role assignment based on user behavior.

#### Acceptance Criteria:
- [ ] System supports multiple user roles (Admin, Batch Manager, etc.).
- [ ] Each role has specific permissions defined.
- [ ] API endpoints are protected with permission middleware.
- [ ] Users can only access functions they have permissions for.
- [ ] Session management with configurable expiration.
- [ ] Multi-factor authentication for admin accounts.
- [ ] Audit logging of all permission-based actions.
- [ ] Role changes require admin approval.

#### User Flow / System Flow:
1. The user attempts to access protected resources.
2. The system checks user authentication status.
3. If authenticated, the system retrieves user permissions.
4. The system validates that the user has required permission for the resource.
5. If authorized, access is granted; otherwise, access is denied.
6. All access attempts are logged for audit purposes.
7. Admin can modify user roles and permissions.
8. Changes take effect immediately for active sessions.

#### System Requirements:
- The system must support multiple user roles (e.g., Admin, Batch Manager).
- Each role must have a specific set of permissions.
- API endpoints must be protected by permission-based middleware.
- Session management should be handled with secure tokens and configurable expiration.

##### System Permissions:
**1. User Management Permissions**
- `users.read` - View user profiles and information
- `users.create` - Create new user accounts
- `users.update` - Modify user information and settings
- `users.delete` - Remove user accounts
- `users.roles.assign` - Assign roles to users
- `users.roles.revoke` - Remove roles from users
- `users.permissions.manage` - Manage user-specific permissions
- `users.registration.manage` - Manage registration settings
- `users.registration.approve` - Approve pending registrations

**2. Customers Management Permissions**
- `customers.read` - View customer profiles and information
- `customers.search` - Search for customers

**3. Batch Management Permissions**
- `batches.read` - View batch information and statistics
- `batches.create` - Create new promotional batches
- `batches.update` - Modify batch settings and parameters
- `batches.delete` - Remove batches (with restrictions)
- `batches.assign` - Assign batches to specific users
- `batches.status.change` - Change batch status (active/expired/blocked)

 **4. Promo Code Management Permissions**
 - `promo-codes.read` - View promo code information
 - `promo-codes.generate` - Generate new promo codes
 - `promo-codes.import` - Import codes from CSV files
 - `promo-codes.download` - Download codes in PDF/CSV format
 - `promo-codes.status.change` - Change individual code status
 - `promo-codes.bulk.operations` - Perform bulk operations on codes
 - `promo-codes.validate` - Validate code format and uniqueness
 - `promo-codes.search` - Search if codes exist only
 - `promo-codes.fraud.report` - Report suspicious Code Redemption to change Code status from `redeemed` status to `reported`

### User Roles and Access:
- **Users:** Authenticated accounts for Admin Panel access with role-based permissions:
    - **Admin:** Full system access
    - **Batch Manager:** Limited to:
        - Verify and Redeem page (Verify Codes functionality)
        - User Profile management

### Customer Registration:
- **Customers:** Automatically registered in the system upon successful redemptions

### Verification and Redemption Workflow:
- **Step 1 (Verification):**
    - Interface: Single input field for Promo Code + "Verify" button
    - Action: System validates code against database and displays:
        - `amount`
        - `status`
- **Step 2 (Active Code Handling):**
    - For valid `active` codes, display:
        - Code amount
        - Active status
        - Input fields:
            - Customer Name (optional)
            - Phone Number (required)
        - "Redeem" button
- **Step 3 (Redemption Process):**
    - On redemption:
        1. Update Promo Code status to `Redeemed`
        2. Auto-register Customer with:
            - Name (if provided)
            - Phone Number (mandatory)
        3. Create Redemption record
- **Step 4 (Redeemed Code Handling):**
    - For `redeemed` codes, display:
        - Current status
        - Redemption timestamp
        - Redeemer's phone number
        - "Fraud Report" button
- **Step 5 (Fraud Reporting):**
    - Fraud Report page collects:
        - New customer details (Name + Phone)
    - System creates fraud record while preserving original redemption data


 **5. Redemption Management Permissions**
 - `redemptions.create.manual` - Create redemption transactions
 - `redemptions.read` - View redemption transactions
 - `redemptions.search` - Search and filter redemption records

 **6. System Alerts**
 - `alerts.read` - View system alerts and notifications
 - `fraud.alerts.view` - View Reported Promo Codes fraud alerts

 **7. System Configuration Permissions**
 - `system.settings.read` - View system configuration
 - `system.settings.update` - Modify system settings
 - `system.settings.export` - Export configuration settings
 - `system.settings.import` - Import configuration settings
 - `system.settings.backup` - Backup configuration settings
 - `system.settings.restore` - Restore configuration settings
 - `system.notifications.setup` - Setup alert notifications
 - `system.backup.manage` - Manage system backups

 ##### Predefined Roles:
 **1. Administrator**
 - Full system access with all permissions
 - Can manage all users, roles, and system settings

 **2. Batch Manager**
 - `promo-codes.search`, `redemptions.create.manual`, `promo-codes.fraud.report`
 - Can verify if code is valid
 - Can redeem valid and active Promo Code
 - Can mark searched valid and `redeemed` Promo Code as `reported` (Fraud Reporting)

 #### Technical Considerations:
 - The authorization is enforced through a `withAuth` middleware function that takes an array of required permissions.
 - The system uses a granular permission system for different user roles.
 - All permission-based actions are logged for auditing purposes.

 #### Implementation Scope:
 - **Full-stack development:**
     - **Backend:** Implementation of RBAC, permission management, secure session handling, and API protection with middleware.
     - **Frontend:** UI components for user role assignment and management.

**API Endpoint Protection**
- All admin endpoints protected with permission middleware
- Granular permission checking for each operation

### 2. Admin Panel Features

 #### Feature Description:
 - Provides a comprehensive administrative interface for managing the entire promo code system. This includes functionalities for batch management, promo code generation, user and customer management, and redemption tracking, all governed by a role-based access control (RBAC) system.

 #### User Story/Use Case:
 - As an administrator, I need a centralized panel to manage all aspects of our promotional campaigns, from creating batches of promo codes to monitoring their redemption and managing user access, so that I can efficiently run and oversee our marketing efforts.

 #### System Requirements:
 - The admin panel must be accessible only to users with administrative privileges.
 - It must provide access to all administrative functionalities, including Batch Management, Promo Code generation, User Management, Customers Management, and Redemption tracking.

 #### Technical Considerations:
 - The admin panel will be a single-page application (SPA) for a seamless user experience.
 - It will communicate with the backend via a RESTful API.
 - All actions performed in the admin panel will be subject to permission checks on the backend.

 #### Implementation Scope:
 - **Full-stack development:**
     - **Backend:** Development of API endpoints for all administrative functionalities.
     - **Frontend:** Creation of a comprehensive UI for the admin panel, including dashboards, tables, forms, and modals.

#### 2.1. Administrative Dashboard

 #### Feature Description:
 - A comprehensive dashboard that provides real-time visibility into all system operations, allowing administrators to monitor promo code redemptions and other key metrics at a glance.

 #### User Story/Use Case:
 - As a system administrator, I want to have a comprehensive dashboard that provides real-time visibility into all system operations, so that I can monitor Promo Codes Redemptions.

 #### Scope:
 - 3 Cards (Redeemed Codes, Redeemed Ammount, Reported Codes within selected timebound)
 - Quick action buttons for common tasks (Generate Code, Download Codes, Import Codes, Verify Codes)
 - Displays recent activity feed with timestamps
 - Responsive design for mobile and desktop access

 #### Out of Scope:
 - Real-time chat or communication features
 - Advanced data visualization with custom charts
 - Automated system maintenance actions

 #### Acceptance Criteria:
 - [ ] Dashboard loads within 2 seconds
 - [ ] Real-time data updates every 5 seconds
 - [ ] Shows key metrics: Redeemed Codes, Redeemed Ammount, Reported Codes within selected timebound
 - [ ] Displays recent activity feed with timestamps
 - [ ] Responsive design works on tablets and mobile devices

 #### User Flow / System Flow:
 1. Admin logs into system
 2. Dashboard automatically loads with default view.
 3. The system displays real-time metrics and recent activities.
 4. Admin can click on any metric to drill down into details.
 5. Quick action buttons provide shortcuts to common tasks.

 #### System Requirements:
 - The dashboard must display real-time metrics such as Redeemed Codes, Redeemed Amount, and Reported Codes within a selected time frame.
 - It should include quick action buttons for common tasks like "Generate Code," "Download Codes," "Import Codes," and "Verify Codes."
 - A recent activity feed with timestamps must be displayed.
 - The design must be responsive for both mobile and desktop access.

 #### Technical Considerations:
 - The dashboard will require real-time data updates, which can be implemented using WebSockets or polling.
 - The quick action buttons will trigger their respective functionalities, which will be handled by the backend.
 - The recent activity feed will be populated with data from the audit logs.

 #### Implementation Scope:
 - **Full-stack development:**
     - **Backend:** Development of API endpoints to provide real-time data for the dashboard.
     - **Frontend:** Creation of the dashboard UI, including the display of metrics, quick action buttons, and the recent activity feed.

#### 2.2. Batch Management

 #### Feature Description:
 - Enables the complete lifecycle management of promo code batches, including their creation, code generation, assignment to users, and the ability to download the generated codes. This feature is central to organizing and distributing promotional codes in a structured manner.

 #### User Story/Use Case:
 - As a system admin, I want to create and manage Promo Codes Batches with configurable parameters, so that I can organize and track Promo Codes Batches effectively.

 #### Scope:
 - Create new batches with configurable parameters
 - Generate unique promo codes in bulk (100,000+ codes per batch)
 - Assign batches to specific users with proper permissions
 - Download batch data in PDF and CSV formats
 - Import existing codes from CSV files

 #### Out of Scope:
 - Automated batch creation based on external triggers
 - Advanced batch analytics with machine learning
 - Real-time batch performance optimization

 #### Acceptance Criteria:
 - [ ] Can create batches with required fields: `batch_name`, `total_codes`, `amount_per_code`, `expiration_date`
 - [ ] `batch_name` should have `BATCH_` prefix
 - [ ] Batch names must be unique within the system
 - [ ] Batch Name should be Auto capitalized
 - [ ] Can generate more than 100,000 promo codes per batch
 - [ ] Generated codes follow format: XXXX-XXYY-XXMM-XXDD
 - [ ] All generated codes are unique within the system
 - [ ] Can assign batches to specific users with proper permissions
 - [ ] Can download batch data in PDF (12 codes per A4 page) and CSV formats
 - [ ] Can import codes from CSV with validation and error reporting
 - [ ] Batch status updates automatically based on expiration and redemption status
 - [ ] Can perform bulk operations: block, unblock or change status of multiple batches
 - [ ] Form validation prevents invalid data entry

 #### User Flow / System Flow:
 1. System Admin navigates to Batch Management section
 2. Views list of batches with action buttons (Common Tasks): "Generate Codes", "Download Codes", "Verify Codes" and "Import Codes"
 3. For new batch and Promo Codes: Clicks "Genererate Codes" button
 4. Fills out batch creation form with required parameters
 5. System validates input and checks for duplicate batch names
 6. Admin assigns batch to specific user (optional)
 7. Admin fill batch descriptions (optional)
 8. Admin click on "Generate"
 8. System creates batch and generates associated promo codes
 9. Admin can view batch details and monitor performance
 10. System automatically updates batch status based on conditions
 11. Admin can use Generate Codes/Download Code/Verify Codes/Import Codes buttons for batch and Promo Codes operations

 #### System Requirements:
 - The system must allow the creation of new batches with configurable parameters such as batch name, total codes, amount per code, and expiration date.
 - It must be possible to generate a large number of unique promo codes (e.g., 100,000+) for each batch.
 - Batches can be assigned to specific users, and the generated codes can be downloaded in PDF and CSV formats.
 - The system must support the import of existing codes from CSV files.
 - Necessary permissions: `batches.read`, `batches.create`, `batches.update`, `batches.assign`, `batches.status.change`, `promo-codes.generate`, `promo-codes.import`, `promo-codes.download`.

 #### Technical Considerations:
 - The batch creation process will involve form validation to ensure data integrity.
 - The generation of a large number of promo codes should be handled as a background process to avoid blocking the UI.
 - The system must ensure the uniqueness of batch names and generated promo codes.

 #### Implementation Scope:
 - **Full-stack development:**
     - **Backend:** Development of API endpoints for creating, managing, and generating batches of promo codes.
     - **Frontend:** Creation of a UI for managing batches, including forms for creating and editing batches, and options for generating, downloading, and importing codes.

 #### System Permissions:
 - `batches.read` - View batch information and statistics
 - `batches.create` - Create new Promo Codes Batches
 - `batches.update` - Modify batch settings and parameters
 - `batches.assign` - Assign batches to specific users
 - `batches.status.change` - Change batch status
 - `promo-codes.generate` - Generate new promo codes
 - `promo-codes.import` - Import codes from CSV files
 - `promo-codes.download` - Download codes in PDF/CSV format

#### 2.3. Promo Code Management

 #### Feature Description:
 - Provides comprehensive lifecycle management for individual promo codes. This includes generating unique codes, tracking their status (active, used, expired, etc.), and performing bulk operations. The feature is designed to ensure code integrity and prevent fraud.

 #### User Story/Use Case:
 - As a system administrator, I want to generate, manage, and track individual promo codes with secure algorithms, so that I can maintain code integrity and prevent fraud.

 #### Scope:
 - Generate unique promo codes using secure timestamp-based algorithms
 - Individual code status management (active, used, expired, redeemed, reported, blocked)
 - Code search and filtering capabilities
 - Bulk operations on codes (status changes, blocking, deletion)
 - Code validation and duplicate detection
 - Import/dowload functionality for codes
 - Fraud reporting and investigation tools

 #### Out of Scope:
 - AI-powered code generation with custom patterns
 - Integration with external code generation services
 - Advanced code analytics and pattern recognition
 - Automated code distribution to external systems

#### Acceptance Criteria:
 - [ ] Can generate codes using format: XXXX-XXYY-XXMM-XXDD
 - [ ] All generated codes are cryptographically secure and unique
 - [ ] Can search codes by batch, status, or partial code match
 - [ ] Can change individual code status (active, blocked, reported)
 - [ ] Can perform bulk operations on multiple codes
 - [ ] Code validation prevents duplicate entries
 - [ ] Import/dowload functionality works with proper validation
 - [ ] Fraud reporting system flags suspicious codes
 - [ ] All code operations are logged for audit purposes

#### Code Format Algorithm:
```
Format: XXXX-XXYY-XXMM-XXDD
Where: X = Random alphanumeric character (except: B, D, O, Q, I and V)
       YY = Year (last 2 digits)
       MM = Month (2 digits)
       DD = Day (2 digits)
Example: A1U2-C325-5X09-6E21
```

 #### User Flow / System Flow:
 1. Admin navigates to Promo Code Management section
 2. Views list of promo codes with action buttons: "Generate Codes", "Import Codes", "Download Codes"
 3. For generation: Clicks "Generate Codes" button, configures parameters and initiates bulk generation
 4. For import: Clicks "Import Codes" button, uploads CSV file with validation
 5. For download: Clicks "Download Codes" button, selects format (PDF/CSV) and batch
 6. For management: Searches, filters, and modifies individual codes
 7. System validates all operations and shows progress
 8. Admin reviews results and performs additional operations as needed

 #### System Requirements:
 - Generate unique promo codes using a secure, timestamp-based algorithm.
 - Manage the status of individual codes (e.g., active, used, expired, redeemed, reported, blocked).
 - Provide search and filtering capabilities for codes.
 - Allow for bulk operations on codes, such as status changes, blocking, and deletion.
 - Include functionality for importing and downloading codes.
 - A fraud reporting and investigation tool is required.
 - Necessary permissions: `promo-codes.read`, `promo-codes.generate`, `promo-codes.import`, `promo-codes.download`, `promo-codes.status.change`, `promo-codes.bulk.operations`, `promo-codes.validate`.

 #### Technical Considerations:
 - The use of a secure algorithm for code generation is critical to prevent tampering and ensure uniqueness.
 - The system must efficiently handle bulk operations on a large number of codes.
 - Code validation and duplicate detection should be implemented to maintain data integrity.

 #### Implementation Scope:
 - **Full-stack development:**
     - **Backend:** Development of API endpoints for all promo code management functionalities.
     - **Frontend:** Creation of a UI for managing promo codes, including a table view with search and filtering, and modals for performing individual and bulk actions.

 #### System Permissions:
 - `promo-codes.read` - View promo code information
 - `promo-codes.generate` - Generate new promo codes
 - `promo-codes.import` - Import codes from CSV files
 - `promo-codes.download` - Download codes in PDF/CSV format
 - `promo-codes.status.change` - Change individual code status
 - `promo-codes.bulk.operations` - Perform bulk operations on codes
 - `promo-codes.validate` - Validate code format and uniqueness

#### 2.4. Promo Code Generation ("Generate Codes")

 #### Feature Description:
 - This feature allows administrators to generate a large number of unique promo codes in a single batch.

 #### User Story/Use Case:
 - As an administrator, I want to be able to generate a large number of unique promo codes at once, so that I can easily create new promotions.

 #### Scope:
 - Generate up to 100,000 unique promo codes at a time.
 - Assign the generated codes to a new or existing batch.
 - Specify the format of the generated codes.

 #### Out of Scope:
 - Generating codes with a custom algorithm.
 - Generating codes one at a time.

 #### Acceptance Criteria:
 - [ ] Administrators can generate up to 100,000 unique promo codes at a time.
 - [ ] The generated codes are assigned to the correct batch.
 - [ ] The generated codes follow the specified format.

 #### User Flow / System Flow:
 1. Admin navigates to the "Promo Code Generation" section.
 2. Admin specifies the number of codes to generate, the batch to assign them to, and the code format.
 3. Admin clicks "Generate".
 4. The system generates the codes and assigns them to the batch.
 5. The system displays a confirmation message with the number of codes generated.

 #### System Requirements:
 - The system must be able to generate a large number of unique promo codes in a single batch.
 - It should be possible to assign the generated codes to a new or existing batch.
 - The format of the generated codes must be configurable.

 #### Technical Considerations:
 - The code generation process should be handled as a background process to avoid blocking the UI.
 - The system must ensure the uniqueness of the generated codes.

 #### Implementation Scope:
 - **Full-stack development:**
     - **Backend:** Development of an API endpoint for generating promo codes.
     - **Frontend:** Creation of a UI for generating promo codes.

#### 2.6. Promo Code Download ("Download Codes")

 #### Feature Description:
 - This feature allows administrators to download a batch of promo codes in either PDF or CSV format.

 #### User Story/Use Case:
 - As an administrator, I want to be able to download a batch of promo codes, so that I can easily distribute them to customers or import them into another system.

 #### Scope:
 - Download a batch of promo codes in PDF format.
 - Download a batch of promo codes in CSV format.
 - Select the batch to download from a list of existing batches.

 #### Out of Scope:
 - Downloading individual promo codes.
 - Customizing the format of the downloaded files.

 #### Acceptance Criteria:
 - [ ] Administrators can download a batch of promo codes in PDF format.
 - [ ] Administrators can download a batch of promo codes in CSV format.
 - [ ] The downloaded files contain the correct promo codes for the selected batch.

 #### User Flow / System Flow:
 1. Admin navigates to the "Promo Code Download" section.
 2. Admin selects the batch to download and the desired format (PDF or CSV).
 3. Admin clicks "Download".
 4. The system generates the file and initiates the download.

 #### System Requirements:
 - The system must be able to download a batch of promo codes in either PDF or CSV format.

 #### Technical Considerations:
 - The file generation process should be handled as a background process to avoid blocking the UI, especially for large batches.
 - The system must ensure that the downloaded files are properly formatted and contain the correct data.

 #### Implementation Scope:
 - **Full-stack development:**
     - **Backend:** Development of API endpoints for generating and downloading promo code files.
     - **Frontend:** Creation of a UI for selecting the batch and format, and initiating the download.

#### 2.6. Promo Code Verification ("Verify Codes")

 #### Feature Description:
 - This feature allows administrators to verify the validity of a promo code and view its details.

 #### User Story/Use Case:
 - As an administrator, I want to be able to quickly verify the validity of a promo code, so that I can assist customers who are having trouble using a code.

 #### Scope:
 - Verify a promo code by entering it into a text field.
 - View the details of a valid code, including its batch, status, and redemption history.
 - Display an error message for invalid or expired codes.

 #### Out of Scope:
 - Verifying multiple codes at once.
 - Verifying codes by scanning a barcode or QR code.

 #### Acceptance Criteria:
 - [ ] Administrators can verify a promo code by entering it into a text field.
 - [ ] The system displays the details of a valid code.
 - [ ] The system displays an error message for invalid or expired codes.

 #### User Flow / System Flow:
 1. Admin navigates to the "Promo Code Verification" section.
 2. Admin enters a promo code into the text field and clicks "Verify".
 3. If the code is valid, the system displays its details.
 4. If the code is invalid or expired, the system displays an error message.

 #### System Requirements:
 - The system must be able to verify the validity of a promo code and view its details.

 #### Technical Considerations:
 - The verification process will require a new UI for entering the code and displaying the results.
 - The backend will need to provide an API endpoint for verifying codes.

 #### Implementation Scope:
 - **Full-stack development:**
     - **Backend:** Development of an API endpoint for verifying promo codes.
     - **Frontend:** Creation of a UI for verifying promo codes.

#### 2.7. Promo Codes Import ("Import Codes")

 #### Feature Description:
 - This feature allows administrators to import a list of promo codes from a CSV file.
 - It supports bulk creation and assignment of codes to a specified batch.
 
 #### User Story/Use Case:
 - As an admin, I want to upload a CSV file with a list of promo codes so that I can quickly add them to the system and assign them to a batch.
 
 #### Scope:
 - The feature includes a file upload interface for CSV files.
 - It validates the CSV file for correct formatting and data integrity.
 - The import process will be handled as a background job to prevent UI blocking.
 
 #### Out of Scope:
 - This feature does not support importing codes from other file formats (e.g., Excel, TXT).
 - Real-time import progress tracking is not included in the initial version.
 
 #### Acceptance Criteria:
 - [ ] The system must accept a CSV file with a "Code" column.
 - [ ] Each code in the file must be unique.
 - [ ] The imported codes must be assigned to the selected batch.
 - [ ] An error message must be displayed if the file format is incorrect or if any codes are duplicates.
 
 #### User Flow / System Flow:
 1. The admin navigates to the "Promo Code Management" section.
 2. They select a batch and click the "Import Codes" button.
 3. A modal or page appears with a file upload input.
 4. The admin selects a CSV file and clicks "Upload."
 5. The system validates the file and queues the import process.
 6. A notification is sent to the admin upon completion or failure.
 
 #### System Requirements:
 - **Access Control:** Only users with "Admin" or "Super Admin" roles can access this feature.
 - **File Format:** The system must validate the CSV file for correct formatting (e.g., column headers).
 - **Error Handling:** If the import fails, the system should provide a clear error message and log the issue.
 
 #### Technical Considerations:
 - **Background Processing:** The import process should run in the background to avoid blocking the UI.
 - **Database Transactions:** Use database transactions to ensure data integrity during the import.
 
 #### Implementation Scope:
 - **Frontend:** Develop a file upload interface with validation and progress tracking.
 - **Backend:** Create an API endpoint to handle file parsing, validation, and database insertion.

#### 2.8. System notifications

Real-time notification system for fraud reporting.

**User Story**: As a system administrator, I want to receive real-time notifications for critical system events and Promo Codes fraud reports, so that I can respond quickly to issues and maintain system integrity.

**Scope**:
- Promo Codes Reported Fraud notifications

**Out of Scope**:
- Advanced machine learning-based fraud detection
- Integration with external SIEM systems
- Automated incident response and remediation
- Advanced correlation and pattern analysis
- Integration with external monitoring tools (Datadog, New Relic)

**Acceptance Criteria**:
- [ ] Fraud detection alerts are triggered for suspicious redemption patterns
- [ ] Alert history is maintained with search and filtering capabilities
- [ ] Alert escalation rules ensure critical alerts reach appropriate personnel
- [ ] All alert activities are logged for audit purposes

**User Flow**:
1. System continuously monitors various metrics and events
2. Alert is processed and routed to appropriate recipients based on severity
3. Recipients receive notification through configured channels
4. Alert is displayed in admin dashboard with acknowledgment options
5. Administrator acknowledges and resolves the alert
6. Alert status is updated and resolution is logged
7. Follow-up notifications are sent if alert remains unresolved

### Detailed System Configuration Categories

#### 1. System Settings
```typescript
interface BrandingSettings {
  // Company Information
  companyName: string;
  companyLogo: File | string;
  companyFavicon: File | string;
  companyTagline: string;
  companyEmail: string;
  companyPhone: string;

  // Social Media Links
  socialMedia: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };

  // Theme and Customization
  theme: {
    primaryColor: string;
    secondaryColor: string;
    font: string;
  };
}

// Update Mechanism
// - A dedicated settings page will be available in the admin panel.
// - Users with appropriate permissions can modify the branding settings.
// - Changes are saved via an API call to the backend.
// - The backend validates the input and returns a success or error message.

// Validation
// - `companyName`, `companyEmail`, `companyPhone` are required fields.
// - `companyEmail` must be a valid email address.
// - `companyLogo` and `companyFavicon` must be valid image files (e.g., PNG, JPG, SVG).
// - Social media URLs must be valid URLs.
// - Theme colors must be valid hex codes.

// Error Handling
// - If validation fails, the UI will display specific error messages for each invalid field.
// - If the API call fails, a general error message will be displayed.
```

#### 2. Security & Access Control
```typescript
interface SecuritySettings {
  // Password Policy
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
  };

  // Two-Factor Authentication (2FA)
  twoFactorAuthentication: {
    enabled: boolean;
    methods: ('email' | 'sms' | 'authenticator_app')[];
  };

  // Session Management
  sessionManagement: {
    sessionTimeout: number; // in minutes
    allowMultipleSessions: boolean;
  };
}

// Update Mechanism
// - Security settings can be modified by administrators from the settings page.
// - Changes are saved via a secure API call.
// - The backend validates the input and applies the new settings.

// Validation
// - `passwordPolicy.minLength` must be a positive integer.
// - `sessionManagement.sessionTimeout` must be a positive integer.

// Error Handling
// - If validation fails, the UI will display specific error messages.
// - If the API call fails, a general error message will be displayed.
```

#### 3. Notification Settings
```typescript
interface NotificationSettings {
  // Email Notifications
  emailNotifications: {
    enabled: boolean;
    recipients: string[];
    events: ('user_registration' | 'password_reset' | 'fraud_alert')[];
  };

  // In-App Notifications
  inAppNotifications: {
    enabled: boolean;
    events: ('new_batch_created' | 'import_completed' | 'system_update')[];
  };
}

// Update Mechanism
// - Notification settings can be configured from the settings page.
// - Changes are saved via an API call.
// - The backend validates the settings and updates the notification service.

// Validation
// - `emailNotifications.recipients` must be a list of valid email addresses.

// Error Handling
// - If validation fails, the UI will display specific error messages.
// - If the API call fails, a general error message will be displayed.
```

#### 4. Backup & Maintenance
```typescript
interface BackupAndMaintenanceSettings {
  // Automated Backups
  automatedBackups: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    retentionPolicy: number; // in days
  };

  // Manual Backups
  manualBackups: {
    lastBackupDate: string; // ISO 8601 format
  };

  // Maintenance Mode
  maintenanceMode: {
    enabled: boolean;
    message: string;
  };
}

// Update Mechanism
// - Backup and maintenance settings can be configured by administrators.
// - Changes are saved via an API call.
// - The backend updates the backup and maintenance jobs accordingly.

// Validation
// - `automatedBackups.retentionPolicy` must be a positive integer.
// - `maintenanceMode.message` is required if maintenance mode is enabled.

// Error Handling
// - If validation fails, the UI will display specific error messages.
// - If the API call fails, a general error message will be displayed.
```

 #### UI/UX Design:
 - The settings page will have a clean, intuitive, and responsive design that works well on both desktop and mobile devices.
 - Each settings category will be clearly separated into its own section.
 - Input fields will have clear labels and placeholders.
 - Save and cancel buttons will be prominently displayed.

 #### Backward Compatibility:
 - The system will be designed to be backward compatible with existing settings.
 - When new settings are introduced, the system will provide default values to ensure that existing functionality is not affected.

 #### Implementation Scope:
 - **Full-stack development:**
     - **Backend:** Development of API endpoints for updating and retrieving all system settings.
     - **Frontend:** Creation of a comprehensive and responsive UI for the settings page.

#### 2.10. User Management
 #### Feature Description:
 - This feature allows administrators to manage user accounts, including creating, editing, and deleting users.
 - It provides a centralized interface for managing user roles and permissions.
 
 #### User Story/Use Case:
 - As a Super Admin, I want to create new user accounts and assign them specific roles to control their access to the system.
 - As an Admin, I want to edit user profiles to update their information or change their roles.
 
 #### Scope:
 - The feature includes a user list with search and filter capabilities.
 - It supports creating, editing, and deleting user accounts.
 - Role assignment and permission management are included.
 
 #### Out of Scope:
 - This feature does not include self-service user registration or password reset.
 - Advanced user analytics and reporting are not part of this feature.
 
 #### Acceptance Criteria:
 - [ ] The system must allow Super Admins to create, edit, and delete any user.
 - [ ] Admins should be able to manage users with lower-level roles.
 - [ ] A confirmation prompt must be displayed before deleting a user.
 
 #### User Flow / System Flow:
 1. The admin navigates to the "User Management" section.
 2. They can view a list of all users.
 3. To create a new user, they click "Add User" and fill out the required fields (e.g., name, email, role).
 4. To edit a user, they select the user from the list and modify their details.
 5. To delete a user, they click the delete icon and confirm the action.
 
 #### System Requirements:
 - **Access Control:**
   - **Super Admin:** Can create, edit, and delete all users.
   - **Admin:** Can manage users with roles below "Admin."
   - **User:** Can only view their own profile.
 - **Data Validation:** The system must validate user input (e.g., email format) to ensure data integrity.
 
 #### Technical Considerations:
 - **Security:** Implement proper security measures to protect user data, including password hashing and secure session management.
 - **Scalability:** The user management system should be designed to handle a growing number of users without performance degradation.
 
 #### Implementation Scope:
 - **Frontend:** Develop a user-friendly interface for managing users, including forms, tables, and search functionality.
 - **Backend:** Create API endpoints for CRUD operations on users and roles.

#### 2.11. Customers Management
 #### Feature Description:
 - This feature provides a centralized interface for managing customer data.
 - It allows administrators to view, search, and filter customer profiles.
 
 #### User Story/Use Case:
 - As an Admin, I want to view a list of all customers to understand our user base.
 - As a Support agent, I want to search for a specific customer to view their redemption history and assist them with any issues.
 
 #### Scope:
 - The feature includes a customer list with search and filter functionality.
 - It displays key customer information, such as name, email, and registration date.
 - It provides a detailed view of each customer's redemption history.
 
 #### Out of Scope:
 - This feature does not include editing or deleting customer profiles.
 - It does not support direct communication with customers (e.g., sending emails).
 
 #### Acceptance Criteria:
 - [ ] The system must display a paginated list of all customers.
 - [ ] The search functionality should allow filtering by name, email, or customer ID.
 - [ ] The customer detail view must show a complete history of their promo code redemptions.
 
 #### User Flow / System Flow:
 1. The admin navigates to the "Customers Management" section.
 2. They can view a list of all customers.
 3. They can use the search bar to find a specific customer.
 4. Clicking on a customer reveals their profile and redemption history.
 
 #### System Requirements:
 - **Access Control:** Access to this feature should be restricted to authorized personnel (e.g., Admins, Support).
 - **Data Privacy:** All customer data must be handled in compliance with privacy regulations (e.g., GDPR).
 
 #### Technical Considerations:
 - **Performance:** The customer list should load quickly, even with a large number of customers.
 - **Data Synchronization:** Customer data should be synchronized in real-time with the main application database.
 
 #### Implementation Scope:
 - **Frontend:** Develop a responsive UI for displaying the customer list and profile details.
 - **Backend:** Create an API endpoint to fetch customer data with efficient filtering and pagination.

#### 2.12. Redemption Management
 #### Feature Description:
 - This feature allows administrators to track and manage promo code redemptions.
 - It provides a detailed log of all redemption activities, including which customer redeemed which code and when.
 
 #### User Story/Use Case:
 - As an Admin, I want to monitor redemption rates to assess the effectiveness of our promotional campaigns.
 - As a Support agent, I want to look up a specific redemption to verify its legitimacy or troubleshoot any issues.
 
 #### Scope:
 - The feature includes a redemption log with search and filter capabilities.
 - It displays detailed information for each redemption, including customer, code, batch, and timestamp.
 - It allows for manual redemption of a code on behalf of a customer.
 
 #### Out of Scope:
 - This feature does not include automated fraud detection.
 - It does not provide advanced analytics or data visualization.
 
 #### Acceptance Criteria:
 - [ ] The system must record every promo code redemption with accurate details.
 - [ ] The redemption log must be searchable by customer, code, or date range.
 - [ ] Admins must be able to manually redeem a code for a customer if needed.
 
 #### User Flow / System Flow:
 1. The admin navigates to the "Redemption Management" section.
 2. They can view a real-time log of all redemptions.
 3. They can use search and filters to find specific redemptions.
 4. To manually redeem a code, they click "Manual Redemption," enter the customer and code details, and submit.
 
 #### System Requirements:
 - **Access Control:** Access to this feature should be restricted to authorized personnel.
 - **Data Integrity:** All redemption records must be accurate and immutable.
 
 #### Technical Considerations:
 - **Real-time Updates:** The redemption log should update in real-time as new redemptions occur.
 - **Auditing:** All manual redemptions should be logged with the administrator's ID for auditing purposes.
 
 #### Implementation Scope:
 - **Frontend:** Develop a UI for displaying the redemption log with search and filtering.
 - **Backend:** Create API endpoints for fetching redemption data and performing manual redemptions.

## ⚙️ Tech Stack<

The MBELYCO Promo v2.0 system is built using a modern, modular monolith architecture.

### Frontend Architecture

**Core Framework**:
- **[Next.js with App Router](https://nextjs.org/docs)** is a powerful React framework for building full-stack web applications. It simplifies development with features like server-side rendering, static site generation, and API routes, enabling developers to focus on building products and shipping quickly.

- **[TypeScript](https://www.typescriptlang.org/)** is a superset of JavaScript that adds static typing, providing better tooling, code quality, and error detection for developers. It is ideal for building large-scale applications and enhances the development experience.

- **[ESLint](https://eslint.org/docs/latest/)** is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code, with the goal of making code more consistent and avoiding bugs.

- **[TailwindCSS](https://tailwindcss.com/)** is a utility-first CSS framework that allows developers to build custom, responsive designs quickly without leaving their HTML. It provides pre-defined classes for layout, typography, colors, and more.

- **[Shadcn/ui](https://ui.shadcn.com/docs/)** is a set of beautifully-designed, accessible components and a code distribution platform. Works with your favorite frameworks and AI models. Open Source. Open Code..

**State Management & Forms**:
- **[Zustand](https://zustand-demo.pmnd.rs)** is a minimal, hook-based state management library for React. It lets you manage global state with zero boilerplate, no context providers, and excellent performance through selective state subscriptions.

- **[React Hook Form](https://react.dev/reference/react/hooks/)** is a popular library for handling forms in React. It focuses on simplicity, performance, and minimal re-renders, using React hooks. Instead of manually managing state for each input, RHF provides a more declarative and efficient way to work with forms.

- **[Zod](https://zod.dev/)** is a TypeScript-first validation library. Using Zod, you can define schemas you can use to validate data, from a simple `string` to a complex nested object.

### Backend Architecture

**Next.js API Routes**: Vercel Serverless API endpoints

**Database & ORM**:
- **[Neon](https://neon.com/)** is a fully managed, serverless PostgreSQL database platform. It offers features like instant provisioning, autoscaling, and database branching, enabling developers to build scalable applications without managing infrastructure.

- **[Drizzle ORM](https://orm.drizzle.team/)** is a lightweight and performant TypeScript ORM designed with developer experience in mind. It provides a seamless interface between application code and database operations while maintaining high performance and reliability.

**Authentication**:
- **[Better Auth](https://www.better-auth.com/)** is a framework-agnostic authentication and authorization library for TypeScript. It provides built-in support for email and password authentication, social sign-on (Google, GitHub, Apple, and more), and multi-factor authentication, simplifying user authentication and account management.

**Queue Processing**:
- **[BullMQ](https://docs.bullmq.io/)** is a Node.js library that implements a fast and robust queue system built on top of Redis that helps in resolving many modern age micro-services architectures. Robust queue system built on Redis for background job processing and disbursement handling.

**Caching and sessions**: 
- **[Upstash Redis](https://upstash.com/docs/redis/overall/getstarted)** is a serverless, cloud-hosted Redis solution designed for modern applications. Think of it as Redis, but without the hassle of managing servers, scaling, or infrastructure.

- **[Jest](https://jestjs.io/docs/getting-started)** is JavaScript Testing Framework.

## 🗄️ Database Design Schema

The database schema will be designed to support the system's functionalities, with tables for users, customers, roles, permissions, batches, promo codes, and redemptions.

-   **Users:** Stores user information, including credentials and role assignments.
-   **Customers:** Stores information about customers who redeem promo codes.
-   **Roles & Permissions:** Defines the RBAC structure.
-   **Batches & Promo Codes:** Manages the lifecycle of promo codes.
-   **Redemptions:** Logs all redemption activities.
-   **System Settings:** Stores system-wide configuration settings.

### Tables and Columns (PostgreSQL)
```sql
- users
  - id (uuid, pk)
  - first_name (text)
  - last_name (text)
  - phone_number (text, unique, null allowed for admins)
  - email (citext, unique, null allowed)
  - password_hash (text)
  - is_active (boolean, default true)
  - mfa_enabled (boolean, default false)
  - failed_login_attempts (integer, default 0)
  - lockout_until (timestamptz, null)
  - created_at, updated_at (timestamptz)

- customers 
  - id (uuid, pk)
  - first_name (text, null)
  - last_name (text, null)
  - phone_number (text, unique)
  - created_at, updated_at (timestamptz)

- roles
  - id (uuid, pk)
  - name (text, unique)
  - description (text)
  - created_at (timestamptz)

- permissions
  - id (uuid, pk)
  - key (text, unique)  // e.g., "batches.read", "promo-codes.generate"
  - description (text)

- role_permissions
  - role_id (uuid, fk roles.id)
  - permission_id (uuid, fk permissions.id)
  - created_at (timestamptz)
  - UNIQUE (role_id, permission_id)

- user_role_assignments
  - user_id (uuid, fk users.id)
  - role_id (uuid, fk roles.id)
  - created_at (timestamptz)
  - UNIQUE (user_id, role_id)

- sessions (Better Auth)
  - id (uuid, pk)
  - user_id (uuid, fk users.id)
  - ip (inet)
  - user_agent (text)
  - expires_at (timestamptz)
  - created_at, updated_at (timestamptz)

- batches
  - id (uuid, pk)
  - batch_name (text, unique)
  - description (text)
  - total_codes (integer)
  - amount_per_code (numeric(14,2))
  - currency (text)
  - expiration_date (timestamptz)
  - assigned_user_id (uuid, fk users.id, null)
  - status (text)  // active, expired, blocked, archived
  - created_at, updated_at (timestamptz)

- promo_codes
  - id (uuid, pk)
  - code (text, unique)
  - batch_id (uuid, fk batches.id)
  - amount (numeric(14,2))
  - status (text)  // active, expired, redeemed, reported, blocked
  - created_at (timestamptz)
  - expires_at (timestamptz, null)
  - redeemed_at (timestamptz, null)
  - reported_at (timestamptz, null)
  - blocked_at (timestamptz, null)
  - metadata (jsonb, default '{}')
  - INDEX (batch_id, status), INDEX (status)

- redemptions
  - id (uuid, pk)
  - user_id (uuid, fk users.id)
  - promo_code_id (uuid, fk promo_codes.id)
  - customer_id (uuid, fk customers.id)
  - amount (numeric(14,2))
  - status (text)  // pending, completed, failed
  - idempotency_key (text, unique)
  - error_code (text, null)
  - error_message (text, null)
  - created_at (timestamptz)
  - completed_at (timestamptz, null)
  - UNIQUE (promo_code_id)  // Prevent duplicate redemption of same code
  - INDEX (user_id, created_at desc)

- system_settings
  - id (uuid, pk)
  - category (text)  // branding, security, notifications
  - key (text)
  - value (jsonb)
  - version (integer, default 1)
  - updated_by_user_id (uuid, fk users.id)
  - updated_at, created_at (timestamptz)
  - UNIQUE (category, key)
  ```