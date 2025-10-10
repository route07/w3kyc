// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../storage/KYCDataStorage.sol";
import "../storage/AuditLogStorage.sol";
import "../storage/TenantConfigStorage.sol";
import "../storage/DIDCredentialStorage.sol";
import "../business/KYCManager.sol";
import "../business/DIDManager.sol";
import "../utility/InputValidator.sol";
import "../utility/BoundsChecker.sol";
import "../utility/VersionManager.sol";
import "../utility/JurisdictionConfig.sol";
import "../utility/FeatureFlags.sol";
import "../utility/CredentialTypeManager.sol";
import "../system/MultisigManager.sol";
import "../system/MultisigModifier.sol";
import "../system/EmergencyManager.sol";
import "../access/AuthorizationManager.sol";
import "../compliance/ComplianceChecker.sol";
import "../governance/GovernanceManager.sol";
import "../examples/MultisigExample.sol";

/**
 * @title KYCOnboardingOrchestrator
 * @dev Orchestrates the entire KYC onboarding process using all 19 deployed contracts
 * @author W3KYC Team
 */
contract KYCOnboardingOrchestrator {
    
    // ============ ENUMS ============
    
    enum OnboardingStep {
        NOT_STARTED,
        REGISTRATION,
        INVESTOR_TYPE_SELECTION,
        ELIGIBILITY_CHECK,
        INSTITUTION_DETAILS,
        UBO_VERIFICATION,
        DIRECTORS_DECLARATION,
        DOCUMENT_UPLOAD,
        FINAL_VERIFICATION,
        COMPLETED,
        FAILED
    }
    
    enum UserType {
        INDIVIDUAL,
        INSTITUTIONAL,
        CORPORATE
    }
    
    // ============ STRUCTS ============
    
    struct OnboardingSession {
        address user;
        OnboardingStep currentStep;
        UserType userType;
        uint256 startTime;
        uint256 lastUpdate;
        bool isActive;
        bool isPaused;
        string jurisdiction;
        mapping(OnboardingStep => bool) stepCompleted;
        mapping(OnboardingStep => bytes32) stepData;
        mapping(OnboardingStep => uint256) stepTimestamps;
        mapping(string => string) userData;
        mapping(string => bool) dataValidated;
    }
    
    struct StepResult {
        bool success;
        string message;
        OnboardingStep nextStep;
        bytes data;
    }
    
    // ============ STATE VARIABLES ============
    
    // Contract references
    KYCDataStorage public kycStorage;
    AuditLogStorage public auditStorage;
    TenantConfigStorage public tenantStorage;
    DIDCredentialStorage public didStorage;
    KYCManager public kycManager;
    DIDManager public didManager;
    InputValidator public validator;
    BoundsChecker public boundsChecker;
    VersionManager public versionManager;
    JurisdictionConfig public jurisdictionConfig;
    FeatureFlags public featureFlags;
    CredentialTypeManager public credentialTypeManager;
    MultisigManager public multisigManager;
    MultisigModifier public multisigModifier;
    EmergencyManager public emergencyManager;
    AuthorizationManager public authorizationManager;
    ComplianceChecker public complianceChecker;
    GovernanceManager public governanceManager;
    MultisigExample public multisigExample;
    
    // Session management
    mapping(address => OnboardingSession) public sessions;
    mapping(address => bool) public hasActiveSession;
    
    // Configuration
    address public owner;
    uint256 public maxSessionDuration = 7 days;
    uint256 public stepTimeout = 1 hours;
    
    // ============ EVENTS ============
    
    event SessionStarted(address indexed user, uint256 timestamp);
    event StepCompleted(address indexed user, OnboardingStep step, uint256 timestamp);
    event StepFailed(address indexed user, OnboardingStep step, string reason, uint256 timestamp);
    event SessionCompleted(address indexed user, uint256 timestamp);
    event SessionFailed(address indexed user, string reason, uint256 timestamp);
    event SessionPaused(address indexed user, uint256 timestamp);
    event SessionResumed(address indexed user, uint256 timestamp);
    event EmergencyModeActivated(uint256 timestamp);
    event EmergencyModeDeactivated(uint256 timestamp);
    
    // ============ MODIFIERS ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyActiveSession() {
        require(hasActiveSession[msg.sender], "No active session");
        require(sessions[msg.sender].isActive, "Session not active");
        require(!sessions[msg.sender].isPaused, "Session is paused");
        _;
    }
    
    modifier onlyWhenNotEmergency() {
        require(!emergencyManager.isEmergencyMode(), "System in emergency mode");
        _;
    }
    
    modifier onlyValidStep(OnboardingStep step) {
        require(step != OnboardingStep.NOT_STARTED, "Invalid step");
        require(step != OnboardingStep.COMPLETED, "Invalid step");
        require(step != OnboardingStep.FAILED, "Invalid step");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _kycStorage,
        address _auditStorage,
        address _tenantStorage,
        address _didStorage,
        address _kycManager,
        address _didManager,
        address _validator,
        address _boundsChecker,
        address _versionManager,
        address _jurisdictionConfig,
        address _featureFlags,
        address _credentialTypeManager,
        address _multisigManager,
        address _multisigModifier,
        address _emergencyManager,
        address _authorizationManager,
        address _complianceChecker,
        address _governanceManager,
        address _multisigExample
    ) {
        owner = msg.sender;
        
        // Initialize contract references
        kycStorage = KYCDataStorage(_kycStorage);
        auditStorage = AuditLogStorage(_auditStorage);
        tenantStorage = TenantConfigStorage(_tenantStorage);
        didStorage = DIDCredentialStorage(_didStorage);
        kycManager = KYCManager(_kycManager);
        didManager = DIDManager(_didManager);
        validator = InputValidator(_validator);
        boundsChecker = BoundsChecker(_boundsChecker);
        versionManager = VersionManager(_versionManager);
        jurisdictionConfig = JurisdictionConfig(_jurisdictionConfig);
        featureFlags = FeatureFlags(_featureFlags);
        credentialTypeManager = CredentialTypeManager(_credentialTypeManager);
        multisigManager = MultisigManager(_multisigManager);
        multisigModifier = MultisigModifier(_multisigModifier);
        emergencyManager = EmergencyManager(_emergencyManager);
        authorizationManager = AuthorizationManager(_authorizationManager);
        complianceChecker = ComplianceChecker(_complianceChecker);
        governanceManager = GovernanceManager(_governanceManager);
        multisigExample = MultisigExample(_multisigExample);
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @dev Start a new KYC onboarding session
     * @param userData Initial user data (email, jurisdiction, etc.)
     */
    function startSession(bytes calldata userData) external onlyWhenNotEmergency {
        require(!hasActiveSession[msg.sender], "Session already active");
        
        (string memory email, string memory jurisdiction) = abi.decode(userData, (string, string));
        
        // Validate input
        require(validator.validateEmail(email), "Invalid email");
        require(bytes(jurisdiction).length > 0, "Jurisdiction required");
        
        // Create new session
        OnboardingSession storage session = sessions[msg.sender];
        session.user = msg.sender;
        session.currentStep = OnboardingStep.REGISTRATION;
        session.userType = UserType.INDIVIDUAL;
        session.startTime = block.timestamp;
        session.lastUpdate = block.timestamp;
        session.isActive = true;
        session.isPaused = false;
        session.jurisdiction = jurisdiction;
        
        // Store initial data
        session.userData["email"] = email;
        session.userData["jurisdiction"] = jurisdiction;
        
        hasActiveSession[msg.sender] = true;
        
        // Log to audit storage
        auditStorage.logEvent(msg.sender, "SESSION_STARTED", 0, userData);
        
        emit SessionStarted(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Execute a specific onboarding step
     * @param step The step to execute
     * @param stepData Encoded data for the step
     */
    function executeStep(
        OnboardingStep step,
        bytes calldata stepData
    ) external onlyActiveSession onlyWhenNotEmergency onlyValidStep(step) {
        OnboardingSession storage session = sessions[msg.sender];
        
        require(session.currentStep == step, "Invalid step sequence");
        require(!session.stepCompleted[step], "Step already completed");
        
        // Check for timeout
        require(block.timestamp - session.lastUpdate <= stepTimeout, "Step timeout");
        
        try this._executeStep(step, stepData) {
            // Mark step as completed
            session.stepCompleted[step] = true;
            session.stepData[step] = keccak256(stepData);
            session.stepTimestamps[step] = block.timestamp;
            session.lastUpdate = block.timestamp;
            
            // Determine next step
            OnboardingStep nextStep = _determineNextStep(session);
            session.currentStep = nextStep;
            
            // Log completion
            auditStorage.logEvent(msg.sender, "STEP_COMPLETED", uint256(step), stepData);
            
            emit StepCompleted(msg.sender, step, block.timestamp);
            
            // Check if onboarding is complete
            if (nextStep == OnboardingStep.COMPLETED) {
                _completeOnboarding(session);
            }
            
        } catch Error(string memory reason) {
            _handleStepFailure(session, step, reason);
        } catch {
            _handleStepFailure(session, step, "Unknown error");
        }
    }
    
    /**
     * @dev Pause the current session
     */
    function pauseSession() external onlyActiveSession {
        OnboardingSession storage session = sessions[msg.sender];
        session.isPaused = true;
        
        auditStorage.logEvent(msg.sender, "SESSION_PAUSED", 0, "");
        emit SessionPaused(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Resume a paused session
     */
    function resumeSession() external {
        require(hasActiveSession[msg.sender], "No active session");
        require(sessions[msg.sender].isPaused, "Session not paused");
        
        OnboardingSession storage session = sessions[msg.sender];
        session.isPaused = false;
        session.lastUpdate = block.timestamp;
        
        auditStorage.logEvent(msg.sender, "SESSION_RESUMED", 0, "");
        emit SessionResumed(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Cancel the current session
     */
    function cancelSession() external {
        require(hasActiveSession[msg.sender], "No active session");
        
        OnboardingSession storage session = sessions[msg.sender];
        session.isActive = false;
        hasActiveSession[msg.sender] = false;
        
        auditStorage.logEvent(msg.sender, "SESSION_CANCELLED", 0, "");
        emit SessionFailed(msg.sender, "User cancelled");
    }
    
    // ============ STEP EXECUTION FUNCTIONS ============
    
    function _executeStep(OnboardingStep step, bytes calldata stepData) internal {
        if (step == OnboardingStep.REGISTRATION) {
            _executeRegistration(stepData);
        } else if (step == OnboardingStep.INVESTOR_TYPE_SELECTION) {
            _executeInvestorTypeSelection(stepData);
        } else if (step == OnboardingStep.ELIGIBILITY_CHECK) {
            _executeEligibilityCheck(stepData);
        } else if (step == OnboardingStep.INSTITUTION_DETAILS) {
            _executeInstitutionDetails(stepData);
        } else if (step == OnboardingStep.UBO_VERIFICATION) {
            _executeUBOVerification(stepData);
        } else if (step == OnboardingStep.DIRECTORS_DECLARATION) {
            _executeDirectorsDeclaration(stepData);
        } else if (step == OnboardingStep.DOCUMENT_UPLOAD) {
            _executeDocumentUpload(stepData);
        } else if (step == OnboardingStep.FINAL_VERIFICATION) {
            _executeFinalVerification(stepData);
        }
    }
    
    function _executeRegistration(bytes calldata data) internal {
        (string memory email, string memory password, string memory firstName, string memory lastName) = 
            abi.decode(data, (string, string, string, string));
        
        // Validate input
        require(validator.validateEmail(email), "Invalid email");
        require(validator.validatePassword(password), "Invalid password");
        require(bytes(firstName).length > 0, "First name required");
        require(bytes(lastName).length > 0, "Last name required");
        
        // Store in KYC storage
        kycStorage.storeKYCData(msg.sender, "email", email);
        kycStorage.storeKYCData(msg.sender, "password_hash", _hashPassword(password));
        kycStorage.storeKYCData(msg.sender, "first_name", firstName);
        kycStorage.storeKYCData(msg.sender, "last_name", lastName);
        kycStorage.storeKYCData(msg.sender, "registration_time", _uintToString(block.timestamp));
        
        // Update KYC status
        kycManager.updateKYCStatus(msg.sender, "PENDING");
        
        // Log audit event
        auditStorage.logEvent(msg.sender, "USER_REGISTERED", 0, data);
    }
    
    function _executeInvestorTypeSelection(bytes calldata data) internal {
        (string memory investorType) = abi.decode(data, (string));
        
        // Validate investor type
        require(_isValidInvestorType(investorType), "Invalid investor type");
        
        // Store investor type
        kycStorage.storeKYCData(msg.sender, "investor_type", investorType);
        
        // Update user type in session
        OnboardingSession storage session = sessions[msg.sender];
        if (keccak256(abi.encodePacked(investorType)) == keccak256(abi.encodePacked("INSTITUTIONAL"))) {
            session.userType = UserType.INSTITUTIONAL;
        } else if (keccak256(abi.encodePacked(investorType)) == keccak256(abi.encodePacked("CORPORATE"))) {
            session.userType = UserType.CORPORATE;
        }
        
        // Log audit event
        auditStorage.logEvent(msg.sender, "INVESTOR_TYPE_SELECTED", 0, data);
    }
    
    function _executeEligibilityCheck(bytes calldata data) internal {
        (string memory country, string memory age, string memory income) = 
            abi.decode(data, (string, string, string));
        
        // Validate input
        require(bytes(country).length > 0, "Country required");
        require(validator.validateAge(age), "Invalid age");
        require(validator.validateIncome(income), "Invalid income");
        
        // Store eligibility data
        kycStorage.storeKYCData(msg.sender, "country", country);
        kycStorage.storeKYCData(msg.sender, "age", age);
        kycStorage.storeKYCData(msg.sender, "income", income);
        
        // Check compliance
        bool isEligible = complianceChecker.checkCompliance(msg.sender);
        require(isEligible, "User not eligible");
        
        // Log audit event
        auditStorage.logEvent(msg.sender, "ELIGIBILITY_CHECKED", 0, data);
    }
    
    function _executeInstitutionDetails(bytes calldata data) internal {
        (string memory companyName, string memory registrationNumber, string memory companyAddress) = 
            abi.decode(data, (string, string, string));
        
        // Validate input
        require(bytes(companyName).length > 0, "Company name required");
        require(bytes(registrationNumber).length > 0, "Registration number required");
        require(bytes(companyAddress).length > 0, "Address required");
        
        // Store institution data
        kycStorage.storeKYCData(msg.sender, "company_name", companyName);
        kycStorage.storeKYCData(msg.sender, "registration_number", registrationNumber);
        kycStorage.storeKYCData(msg.sender, "company_address", companyAddress);
        
        // Set up tenant configuration
        tenantStorage.setTenantConfig(msg.sender, "institution_type", "CORPORATE");
        tenantStorage.setTenantConfig(msg.sender, "verification_level", "HIGH");
        
        // Log audit event
        auditStorage.logEvent(msg.sender, "INSTITUTION_DETAILS_SUBMITTED", 0, data);
    }
    
    function _executeUBOVerification(bytes calldata data) internal {
        (string memory uboName, string memory uboAddress, string memory ownershipPercentage) = 
            abi.decode(data, (string, string, string));
        
        // Validate input
        require(bytes(uboName).length > 0, "UBO name required");
        require(bytes(uboAddress).length > 0, "UBO address required");
        require(validator.validatePercentage(ownershipPercentage), "Invalid ownership percentage");
        
        // Store UBO data
        kycStorage.storeKYCData(msg.sender, "ubo_name", uboName);
        kycStorage.storeKYCData(msg.sender, "ubo_address", uboAddress);
        kycStorage.storeKYCData(msg.sender, "ownership_percentage", ownershipPercentage);
        
        // Log audit event
        auditStorage.logEvent(msg.sender, "UBO_VERIFIED", 0, data);
    }
    
    function _executeDirectorsDeclaration(bytes calldata data) internal {
        (string[] memory directorNames, string[] memory directorAddresses) = 
            abi.decode(data, (string[], string[]));
        
        // Validate input
        require(directorNames.length > 0, "At least one director required");
        require(directorNames.length == directorAddresses.length, "Directors data mismatch");
        
        // Store directors data
        for (uint i = 0; i < directorNames.length; i++) {
            kycStorage.storeKYCData(msg.sender, string(abi.encodePacked("director_", i, "_name")), directorNames[i]);
            kycStorage.storeKYCData(msg.sender, string(abi.encodePacked("director_", i, "_address")), directorAddresses[i]);
        }
        
        // Set up multisig for directors
        multisigManager.addSigner(msg.sender, msg.sender);
        for (uint i = 0; i < directorAddresses.length; i++) {
            multisigManager.addSigner(msg.sender, _parseAddress(directorAddresses[i]));
        }
        
        // Log audit event
        auditStorage.logEvent(msg.sender, "DIRECTORS_DECLARED", directorNames.length, data);
    }
    
    function _executeDocumentUpload(bytes calldata data) internal {
        (string[] memory documentHashes, string[] memory documentTypes) = 
            abi.decode(data, (string[], string[]));
        
        // Validate input
        require(documentHashes.length > 0, "At least one document required");
        require(documentHashes.length == documentTypes.length, "Documents data mismatch");
        
        // Store documents as DID credentials
        for (uint i = 0; i < documentHashes.length; i++) {
            // Validate document type
            require(credentialTypeManager.isValidCredentialType(documentTypes[i]), "Invalid document type");
            
            // Store in DID storage
            didStorage.storeCredential(
                msg.sender,
                documentTypes[i],
                documentHashes[i],
                block.timestamp
            );
            
            // Validate document
            require(validator.validateDocument(documentHashes[i], documentTypes[i]), "Invalid document");
        }
        
        // Log audit event
        auditStorage.logEvent(msg.sender, "DOCUMENTS_UPLOADED", documentHashes.length, data);
    }
    
    function _executeFinalVerification(bytes calldata data) internal {
        // Perform final compliance check
        bool isCompliant = complianceChecker.checkCompliance(msg.sender);
        require(isCompliant, "Final compliance check failed");
        
        // Create DID for user
        string memory did = _generateDID(msg.sender);
        didManager.createDID(msg.sender, did);
        
        // Update KYC status to verified
        kycManager.updateKYCStatus(msg.sender, "VERIFIED");
        
        // Log audit event
        auditStorage.logEvent(msg.sender, "FINAL_VERIFICATION_COMPLETED", 0, data);
    }
    
    // ============ HELPER FUNCTIONS ============
    
    function _determineNextStep(OnboardingSession storage session) internal view returns (OnboardingStep) {
        if (session.currentStep == OnboardingStep.REGISTRATION) {
            return OnboardingStep.INVESTOR_TYPE_SELECTION;
        } else if (session.currentStep == OnboardingStep.INVESTOR_TYPE_SELECTION) {
            return OnboardingStep.ELIGIBILITY_CHECK;
        } else if (session.currentStep == OnboardingStep.ELIGIBILITY_CHECK) {
            if (session.userType == UserType.INSTITUTIONAL || session.userType == UserType.CORPORATE) {
                return OnboardingStep.INSTITUTION_DETAILS;
            } else {
                return OnboardingStep.DOCUMENT_UPLOAD;
            }
        } else if (session.currentStep == OnboardingStep.INSTITUTION_DETAILS) {
            return OnboardingStep.UBO_VERIFICATION;
        } else if (session.currentStep == OnboardingStep.UBO_VERIFICATION) {
            return OnboardingStep.DIRECTORS_DECLARATION;
        } else if (session.currentStep == OnboardingStep.DIRECTORS_DECLARATION) {
            return OnboardingStep.DOCUMENT_UPLOAD;
        } else if (session.currentStep == OnboardingStep.DOCUMENT_UPLOAD) {
            return OnboardingStep.FINAL_VERIFICATION;
        } else if (session.currentStep == OnboardingStep.FINAL_VERIFICATION) {
            return OnboardingStep.COMPLETED;
        }
        
        return OnboardingStep.FAILED;
    }
    
    function _completeOnboarding(OnboardingSession storage session) internal {
        session.currentStep = OnboardingStep.COMPLETED;
        session.isActive = false;
        hasActiveSession[session.user] = false;
        
        // Log completion
        auditStorage.logEvent(session.user, "ONBOARDING_COMPLETED", 0, "");
        
        emit SessionCompleted(session.user, block.timestamp);
    }
    
    function _handleStepFailure(OnboardingSession storage session, OnboardingStep step, string memory reason) internal {
        session.currentStep = OnboardingStep.FAILED;
        session.isActive = false;
        hasActiveSession[session.user] = false;
        
        // Log failure
        auditStorage.logEvent(session.user, "STEP_FAILED", uint256(step), abi.encode(reason));
        
        emit StepFailed(session.user, step, reason, block.timestamp);
        emit SessionFailed(session.user, reason);
    }
    
    function _isValidInvestorType(string memory investorType) internal pure returns (bool) {
        bytes32 hash = keccak256(abi.encodePacked(investorType));
        return hash == keccak256(abi.encodePacked("INDIVIDUAL")) ||
               hash == keccak256(abi.encodePacked("INSTITUTIONAL")) ||
               hash == keccak256(abi.encodePacked("CORPORATE"));
    }
    
    function _hashPassword(string memory password) internal pure returns (string memory) {
        return _uintToString(uint256(keccak256(abi.encodePacked(password))));
    }
    
    function _generateDID(address user) internal pure returns (string memory) {
        return string(abi.encodePacked("did:w3kyc:", _addressToString(user)));
    }
    
    function _addressToString(address addr) internal pure returns (string memory) {
        return _uintToString(uint256(uint160(addr)));
    }
    
    function _uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    function _parseAddress(string memory addrStr) internal pure returns (address) {
        bytes memory addrBytes = bytes(addrStr);
        require(addrBytes.length == 42, "Invalid address format");
        require(addrBytes[0] == '0' && addrBytes[1] == 'x', "Invalid address prefix");
        
        uint160 result = 0;
        for (uint i = 2; i < 42; i++) {
            result *= 16;
            uint8 b = uint8(addrBytes[i]);
            if (b >= 48 && b <= 57) {
                result += b - 48;
            } else if (b >= 65 && b <= 70) {
                result += b - 55;
            } else if (b >= 97 && b <= 102) {
                result += b - 87;
            } else {
                revert("Invalid address character");
            }
        }
        return address(result);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getSession(address user) external view returns (
        address sessionUser,
        OnboardingStep currentStep,
        UserType userType,
        uint256 startTime,
        uint256 lastUpdate,
        bool isActive,
        bool isPaused,
        string memory jurisdiction
    ) {
        OnboardingSession storage session = sessions[user];
        return (
            session.user,
            session.currentStep,
            session.userType,
            session.startTime,
            session.lastUpdate,
            session.isActive,
            session.isPaused,
            session.jurisdiction
        );
    }
    
    function isStepCompleted(address user, OnboardingStep step) external view returns (bool) {
        return sessions[user].stepCompleted[step];
    }
    
    function getStepData(address user, OnboardingStep step) external view returns (bytes32) {
        return sessions[user].stepData[step];
    }
    
    function getStepTimestamp(address user, OnboardingStep step) external view returns (uint256) {
        return sessions[user].stepTimestamps[step];
    }
    
    function getUserData(address user, string memory key) external view returns (string memory) {
        return sessions[user].userData[key];
    }
    
    function isDataValidated(address user, string memory key) external view returns (bool) {
        return sessions[user].dataValidated[key];
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function setMaxSessionDuration(uint256 duration) external onlyOwner {
        maxSessionDuration = duration;
    }
    
    function setStepTimeout(uint256 timeout) external onlyOwner {
        stepTimeout = timeout;
    }
    
    function emergencyPause() external onlyOwner {
        emergencyManager.activateEmergencyMode();
        emit EmergencyModeActivated(block.timestamp);
    }
    
    function emergencyResume() external onlyOwner {
        emergencyManager.deactivateEmergencyMode();
        emit EmergencyModeDeactivated(block.timestamp);
    }
    
    function forceCompleteSession(address user) external onlyOwner {
        require(hasActiveSession[user], "No active session");
        
        OnboardingSession storage session = sessions[user];
        session.currentStep = OnboardingStep.COMPLETED;
        session.isActive = false;
        hasActiveSession[user] = false;
        
        auditStorage.logEvent(user, "SESSION_FORCE_COMPLETED", 0, "");
        emit SessionCompleted(user, block.timestamp);
    }
    
    function forceFailSession(address user, string memory reason) external onlyOwner {
        require(hasActiveSession[user], "No active session");
        
        OnboardingSession storage session = sessions[user];
        session.currentStep = OnboardingStep.FAILED;
        session.isActive = false;
        hasActiveSession[user] = false;
        
        auditStorage.logEvent(user, "SESSION_FORCE_FAILED", 0, abi.encode(reason));
        emit SessionFailed(user, reason);
    }
}