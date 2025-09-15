// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GovernanceManager
 * @dev Multi-signature governance system for the Web3 KYC system
 * @notice This contract manages governance decisions and replaces centralized owner control
 * @author Web3 KYC Team
 */
contract GovernanceManager is ReentrancyGuard, Ownable {
    
    // ============ STRUCTS ============
    
    /**
     * @dev Structure to store governance proposals
     */
    struct Proposal {
        uint256 id;                     // Unique proposal ID
        address proposer;               // Address that created the proposal
        string title;                   // Proposal title
        string description;             // Proposal description
        address target;                 // Target contract address
        bytes data;                     // Function call data
        uint256 value;                  // ETH value to send
        uint256 startTime;              // When voting starts
        uint256 endTime;                // When voting ends
        uint256 forVotes;               // Votes in favor
        uint256 againstVotes;           // Votes against
        bool executed;                  // Whether proposal was executed
        bool canceled;                  // Whether proposal was canceled
        mapping(address => bool) hasVoted; // Whether address has voted
        mapping(address => uint256) votes; // Votes cast by address
    }
    
    /**
     * @dev Structure to store governance configuration
     */
    struct GovernanceConfig {
        uint256 votingDelay;            // Delay before voting starts (seconds)
        uint256 votingPeriod;           // Duration of voting period (seconds)
        uint256 proposalThreshold;      // Minimum votes required to create proposal
        uint256 quorumVotes;            // Minimum votes required for proposal to pass
        uint256 executionDelay;         // Delay before proposal can be executed (seconds)
    }
    
    // ============ STATE VARIABLES ============
    
    // Governance configuration
    GovernanceConfig public config;
    
    // Proposals
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    // Governance tokens (simplified - in production, use proper token)
    mapping(address => uint256) public votingPower;
    mapping(address => bool) public isGovernor;
    
    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        address target,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        uint256 votes,
        bool support
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        address indexed executor
    );
    
    event ProposalCanceled(
        uint256 indexed proposalId,
        address indexed canceler
    );
    
    event GovernanceConfigUpdated(
        string field,
        uint256 oldValue,
        uint256 newValue
    );
    
    event GovernorAdded(
        address indexed governor,
        uint256 votingPower
    );
    
    event GovernorRemoved(
        address indexed governor
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyGovernor() {
        require(isGovernor[msg.sender] || msg.sender == owner(), "Not a governor");
        _;
    }
    
    modifier validProposal(uint256 proposalId) {
        require(proposalId < proposalCount, "Invalid proposal ID");
        _;
    }
    
    modifier proposalExists(uint256 proposalId) {
        require(proposalId < proposalCount, "Proposal does not exist");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Constructor to initialize the governance system
     */
    constructor() {
        // Initialize default configuration
        config = GovernanceConfig({
            votingDelay: 1 days,        // 1 day delay before voting starts
            votingPeriod: 3 days,       // 3 days voting period
            proposalThreshold: 1000,    // 1000 votes required to create proposal
            quorumVotes: 10000,         // 10000 votes required for quorum
            executionDelay: 1 days      // 1 day delay before execution
        });
        
        // Owner is automatically a governor
        isGovernor[msg.sender] = true;
        votingPower[msg.sender] = 10000; // Initial voting power
    }
    
    // ============ GOVERNANCE CONFIGURATION ============
    
    /**
     * @dev Update governance configuration (only owner)
     * @param _votingDelay New voting delay
     * @param _votingPeriod New voting period
     * @param _proposalThreshold New proposal threshold
     * @param _quorumVotes New quorum votes
     * @param _executionDelay New execution delay
     */
    function updateGovernanceConfig(
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _proposalThreshold,
        uint256 _quorumVotes,
        uint256 _executionDelay
    ) external onlyOwner {
        uint256 oldVotingDelay = config.votingDelay;
        uint256 oldVotingPeriod = config.votingPeriod;
        
        config.votingDelay = _votingDelay;
        config.votingPeriod = _votingPeriod;
        config.proposalThreshold = _proposalThreshold;
        config.quorumVotes = _quorumVotes;
        config.executionDelay = _executionDelay;
        
        emit GovernanceConfigUpdated("votingDelay", oldVotingDelay, _votingDelay);
        emit GovernanceConfigUpdated("votingPeriod", oldVotingPeriod, _votingPeriod);
    }
    
    // ============ GOVERNOR MANAGEMENT ============
    
    /**
     * @dev Add a new governor
     * @param governor Address of the new governor
     * @param power Voting power to assign
     */
    function addGovernor(address governor, uint256 power) external onlyOwner {
        require(governor != address(0), "Invalid governor address");
        require(power > 0, "Invalid voting power");
        
        isGovernor[governor] = true;
        votingPower[governor] = power;
        
        emit GovernorAdded(governor, power);
    }
    
    /**
     * @dev Remove a governor
     * @param governor Address of the governor to remove
     */
    function removeGovernor(address governor) external onlyOwner {
        require(governor != address(0), "Invalid governor address");
        require(governor != owner(), "Cannot remove owner");
        
        isGovernor[governor] = false;
        votingPower[governor] = 0;
        
        emit GovernorRemoved(governor);
    }
    
    /**
     * @dev Update governor's voting power
     * @param governor Address of the governor
     * @param power New voting power
     */
    function updateGovernorPower(address governor, uint256 power) external onlyOwner {
        require(isGovernor[governor], "Not a governor");
        require(power > 0, "Invalid voting power");
        
        votingPower[governor] = power;
    }
    
    // ============ PROPOSAL FUNCTIONS ============
    
    /**
     * @dev Create a new governance proposal
     * @param title Proposal title
     * @param description Proposal description
     * @param target Target contract address
     * @param data Function call data
     * @param value ETH value to send
     * @return proposalId ID of the created proposal
     */
    function propose(
        string memory title,
        string memory description,
        address target,
        bytes memory data,
        uint256 value
    ) external onlyGovernor nonReentrant returns (uint256) {
        require(votingPower[msg.sender] >= config.proposalThreshold, "Insufficient voting power");
        require(bytes(title).length > 0, "Invalid title");
        require(bytes(description).length > 0, "Invalid description");
        require(target != address(0), "Invalid target address");
        
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.title = title;
        proposal.description = description;
        proposal.target = target;
        proposal.data = data;
        proposal.value = value;
        proposal.startTime = block.timestamp + config.votingDelay;
        proposal.endTime = block.timestamp + config.votingDelay + config.votingPeriod;
        proposal.forVotes = 0;
        proposal.againstVotes = 0;
        proposal.executed = false;
        proposal.canceled = false;
        
        emit ProposalCreated(proposalId, msg.sender, title, target, proposal.startTime, proposal.endTime);
        
        return proposalId;
    }
    
    /**
     * @dev Cast a vote on a proposal
     * @param proposalId ID of the proposal
     * @param support Whether to vote for or against
     */
    function castVote(uint256 proposalId, bool support) external onlyGovernor proposalExists(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.canceled, "Proposal canceled");
        
        uint256 votes = votingPower[msg.sender];
        require(votes > 0, "No voting power");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.votes[msg.sender] = votes;
        
        if (support) {
            proposal.forVotes += votes;
        } else {
            proposal.againstVotes += votes;
        }
        
        emit VoteCast(proposalId, msg.sender, votes, support);
    }
    
    /**
     * @dev Execute a successful proposal
     * @param proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 proposalId) external onlyGovernor proposalExists(proposalId) nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp >= proposal.endTime, "Voting not ended");
        require(block.timestamp >= proposal.endTime + config.executionDelay, "Execution delay not met");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.canceled, "Proposal canceled");
        require(proposal.forVotes > proposal.againstVotes, "Proposal not passed");
        require(proposal.forVotes + proposal.againstVotes >= config.quorumVotes, "Quorum not met");
        
        proposal.executed = true;
        
        // Execute the proposal
        (bool success, ) = proposal.target.call{value: proposal.value}(proposal.data);
        require(success, "Proposal execution failed");
        
        emit ProposalExecuted(proposalId, msg.sender);
    }
    
    /**
     * @dev Cancel a proposal (only proposer or owner)
     * @param proposalId ID of the proposal to cancel
     */
    function cancelProposal(uint256 proposalId) external proposalExists(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "Not authorized to cancel"
        );
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.canceled, "Proposal already canceled");
        
        proposal.canceled = true;
        
        emit ProposalCanceled(proposalId, msg.sender);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get proposal details
     * @param proposalId ID of the proposal
     * @return id Proposal ID
     * @return proposer Proposer address
     * @return title Proposal title
     * @return description Proposal description
     * @return target Target contract address
     * @return startTime Voting start time
     * @return endTime Voting end time
     * @return forVotes Votes in favor
     * @return againstVotes Votes against
     * @return executed Whether executed
     * @return canceled Whether canceled
     */
    function getProposal(uint256 proposalId) external view proposalExists(proposalId) returns (
        uint256 id,
        address proposer,
        string memory title,
        string memory description,
        address target,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        bool executed,
        bool canceled
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.target,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.executed,
            proposal.canceled
        );
    }
    
    /**
     * @dev Check if a proposal can be executed
     * @param proposalId ID of the proposal
     * @return Whether the proposal can be executed
     */
    function canExecuteProposal(uint256 proposalId) external view proposalExists(proposalId) returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        
        return (
            block.timestamp >= proposal.endTime &&
            block.timestamp >= proposal.endTime + config.executionDelay &&
            !proposal.executed &&
            !proposal.canceled &&
            proposal.forVotes > proposal.againstVotes &&
            proposal.forVotes + proposal.againstVotes >= config.quorumVotes
        );
    }
    
    /**
     * @dev Get governance configuration
     * @return Complete governance configuration
     */
    function getGovernanceConfig() external view returns (GovernanceConfig memory) {
        return config;
    }
    
    /**
     * @dev Check if an address is a governor
     * @param governor Address to check
     * @return Whether the address is a governor
     */
    function isAddressGovernor(address governor) external view returns (bool) {
        return isGovernor[governor] || governor == owner();
    }
    
    /**
     * @dev Get voting power of an address
     * @param governor Address to check
     * @return Voting power of the address
     */
    function getVotingPower(address governor) external view returns (uint256) {
        return votingPower[governor];
    }
    
    /**
     * @dev Get total number of proposals
     * @return Total number of proposals
     */
    function getProposalCount() external view returns (uint256) {
        return proposalCount;
    }
}
