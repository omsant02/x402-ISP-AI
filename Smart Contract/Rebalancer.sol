// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

/**
 * @title PortfolioRebalancerRegistry
 * @dev Smart contract registry for AI-powered portfolio rebalancing
 * Manages user deposits in USDC, risk profiles, and provides AI agent access to funds
 */
contract PortfolioRebalancerRegistry {
    
    // Enums
    enum RiskLevel { LOW, HIGH }
    
    // Structs
    struct Deposit {
        uint256 depositId;
        uint256 amount;
        RiskLevel risk;
        uint256 depositTime;
        uint256 lockPeriod; // in seconds
        bool isActive;
    }
    
    // State variables
    address public aiAgentWallet;
    address public owner;
    IERC20 public usdcToken;
    
    // Mappings - changed to support multiple deposits per user
    mapping(address => Deposit[]) public userDeposits;
    mapping(address => uint256) public userDepositCount;
    
    // Total funds available
    uint256 public totalDeposits;
    uint256 public nextDepositId;
    
    // Events
    event DepositMade(
        address indexed user,
        uint256 indexed depositId,
        uint256 amount,
        RiskLevel risk,
        uint256 lockPeriod,
        uint256 timestamp
    );
    
    event WithdrawalByUser(
        address indexed user,
        uint256 indexed depositId,
        uint256 amount,
        uint256 timestamp
    );
    
    event WithdrawalByAI(
        address indexed aiAgent,
        uint256 amount,
        uint256 timestamp
    );
    
    event AIAgentUpdated(
        address indexed oldAgent,
        address indexed newAgent,
        uint256 timestamp
    );
    
    event FundsReturned(
        address indexed aiAgent,
        uint256 amount,
        uint256 timestamp
    );
    
    event DepositCredited(
        address indexed user,
        uint256 indexed depositId,
        uint256 creditAmount,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAIAgent() {
        require(msg.sender == aiAgentWallet, "Only AI agent can call this function");
        _;
    }
    
    /**
     * @dev Constructor sets the AI agent wallet, USDC token address, and owner
     * @param _aiAgentWallet Address of the AI agent wallet
     * @param _usdcToken Address of the USDC token contract
     */
    constructor(address _aiAgentWallet, address _usdcToken) {
        require(_aiAgentWallet != address(0), "Invalid AI agent address");
        require(_usdcToken != address(0), "Invalid USDC token address");
        aiAgentWallet = _aiAgentWallet;
        usdcToken = IERC20(_usdcToken);
        owner = msg.sender;
        nextDepositId = 1;
    }
    
    /**
     * @dev Allows users to deposit USDC with risk preference and lock period
     * @param _amount Amount of USDC to deposit (in USDC's smallest unit, typically 6 decimals)
     * @param _risk Risk level (0 = LOW, 1 = HIGH)
     * @param _lockPeriodDays Number of days to lock the deposit
     */
    function deposit(uint256 _amount, RiskLevel _risk, uint256 _lockPeriodDays) external {
        require(_amount > 0, "Deposit amount must be greater than 0");
        require(_lockPeriodDays > 0, "Lock period must be greater than 0");
        
        // Transfer USDC from user to contract
        require(
            usdcToken.transferFrom(msg.sender, address(this), _amount),
            "USDC transfer failed"
        );
        
        uint256 lockPeriodSeconds = _lockPeriodDays * 1 days;
        uint256 depositId = nextDepositId++;
        
        Deposit memory newDeposit = Deposit({
            depositId: depositId,
            amount: _amount,
            risk: _risk,
            depositTime: block.timestamp,
            lockPeriod: lockPeriodSeconds,
            isActive: true
        });
        
        userDeposits[msg.sender].push(newDeposit);
        userDepositCount[msg.sender]++;
        totalDeposits += _amount;
        
        emit DepositMade(
            msg.sender,
            depositId,
            _amount,
            _risk,
            lockPeriodSeconds,
            block.timestamp
        );
    }
    
    /**
     * @dev Allows users to withdraw a specific deposit after lock period
     * @param _depositId The ID of the deposit to withdraw
     */
    function withdrawDeposit(uint256 _depositId) external {
        Deposit[] storage deposits = userDeposits[msg.sender];
        require(deposits.length > 0, "No deposits found");
        
        // Find the deposit
        bool found = false;
        uint256 index = 0;
        for (uint256 i = 0; i < deposits.length; i++) {
            if (deposits[i].depositId == _depositId) {
                found = true;
                index = i;
                break;
            }
        }
        
        require(found, "Deposit ID not found");
        Deposit storage userDeposit = deposits[index];
        require(userDeposit.isActive, "Deposit is not active");
        require(
            block.timestamp >= userDeposit.depositTime + userDeposit.lockPeriod,
            "Lock period has not expired"
        );
        
        uint256 amount = userDeposit.amount;
        require(usdcToken.balanceOf(address(this)) >= amount, "Insufficient contract balance");
        
        // Mark as inactive before transfer to prevent reentrancy
        userDeposit.isActive = false;
        totalDeposits -= amount;
        
        require(usdcToken.transfer(msg.sender, amount), "USDC transfer failed");
        
        emit WithdrawalByUser(msg.sender, _depositId, amount, block.timestamp);
    }
    
    /**
     * @dev Allows AI agent to withdraw USDC for rebalancing
     * @param _amount Amount of USDC to withdraw
     */
    function aiAgentWithdraw(uint256 _amount) external onlyAIAgent {
        require(_amount > 0, "Amount must be greater than 0");
        require(usdcToken.balanceOf(address(this)) >= _amount, "Insufficient contract balance");
        require(_amount <= totalDeposits, "Cannot withdraw more than total deposits");
        
        require(usdcToken.transfer(aiAgentWallet, _amount), "USDC transfer failed");
        
        emit WithdrawalByAI(aiAgentWallet, _amount, block.timestamp);
    }
    
    /**
     * @dev Allows AI agent to return USDC to the contract after rebalancing
     * This adds to the general pool and increases contract balance
     * @param _amount Amount of USDC to return
     */
    function aiAgentReturnFunds(uint256 _amount) external onlyAIAgent {
        require(_amount > 0, "Return amount must be greater than 0");
        
        require(
            usdcToken.transferFrom(aiAgentWallet, address(this), _amount),
            "USDC transfer failed"
        );
        
        emit FundsReturned(aiAgentWallet, _amount, block.timestamp);
    }
    
    /**
     * @dev Allows AI agent to credit returns to a specific user's deposit
     * This increases the deposit amount with profits from rebalancing
     * @param _user User address to credit
     * @param _depositId Deposit ID to credit
     * @param _amount Amount of USDC to add to the deposit
     */
    function aiAgentCreditDeposit(address _user, uint256 _depositId, uint256 _amount) external onlyAIAgent {
        require(_amount > 0, "Credit amount must be greater than 0");
        require(_user != address(0), "Invalid user address");
        
        Deposit[] storage deposits = userDeposits[_user];
        require(deposits.length > 0, "No deposits found for user");
        
        // Find the deposit
        bool found = false;
        uint256 index = 0;
        for (uint256 i = 0; i < deposits.length; i++) {
            if (deposits[i].depositId == _depositId) {
                found = true;
                index = i;
                break;
            }
        }
        
        require(found, "Deposit ID not found");
        require(deposits[index].isActive, "Deposit is not active");
        
        // Transfer USDC from AI agent to contract
        require(
            usdcToken.transferFrom(aiAgentWallet, address(this), _amount),
            "USDC transfer failed"
        );
        
        // Credit the deposit with returns
        deposits[index].amount += _amount;
        totalDeposits += _amount;
        
        emit DepositCredited(_user, _depositId, _amount, block.timestamp);
    }
    
    /**
     * @dev Allows AI agent to credit returns to multiple deposits at once
     * Useful for batch processing after rebalancing
     * @param _users Array of user addresses
     * @param _depositIds Array of deposit IDs
     * @param _amounts Array of amounts to credit
     */
    function aiAgentCreditMultipleDeposits(
        address[] calldata _users,
        uint256[] calldata _depositIds,
        uint256[] calldata _amounts
    ) external onlyAIAgent {
        require(
            _users.length == _depositIds.length && _depositIds.length == _amounts.length,
            "Array lengths must match"
        );
        require(_users.length > 0, "Arrays cannot be empty");
        
        uint256 totalAmount = 0;
        
        // Calculate total amount needed
        for (uint256 i = 0; i < _amounts.length; i++) {
            require(_amounts[i] > 0, "Credit amount must be greater than 0");
            totalAmount += _amounts[i];
        }
        
        // Transfer total USDC from AI agent to contract
        require(
            usdcToken.transferFrom(aiAgentWallet, address(this), totalAmount),
            "USDC transfer failed"
        );
        
        // Credit each deposit
        for (uint256 i = 0; i < _users.length; i++) {
            address user = _users[i];
            uint256 depositId = _depositIds[i];
            uint256 amount = _amounts[i];
            
            require(user != address(0), "Invalid user address");
            
            Deposit[] storage deposits = userDeposits[user];
            require(deposits.length > 0, "No deposits found for user");
            
            // Find the deposit
            bool found = false;
            uint256 index = 0;
            for (uint256 j = 0; j < deposits.length; j++) {
                if (deposits[j].depositId == depositId) {
                    found = true;
                    index = j;
                    break;
                }
            }
            
            require(found, "Deposit ID not found");
            require(deposits[index].isActive, "Deposit is not active");
            
            // Credit the deposit
            deposits[index].amount += amount;
            totalDeposits += amount;
            
            emit DepositCredited(user, depositId, amount, block.timestamp);
        }
    }
    
    /**
     * @dev Update AI agent wallet address
     * @param _newAIAgent New AI agent wallet address
     */
    function updateAIAgent(address _newAIAgent) external onlyOwner {
        require(_newAIAgent != address(0), "Invalid address");
        address oldAgent = aiAgentWallet;
        aiAgentWallet = _newAIAgent;
        
        emit AIAgentUpdated(oldAgent, _newAIAgent, block.timestamp);
    }
    
    /**
     * @dev Get specific deposit details for a user by deposit ID
     * @param _user User address
     * @param _depositId Deposit ID to retrieve
     * @return depositId The deposit ID
     * @return amount Deposit amount
     * @return risk Risk level
     * @return depositTime Timestamp of deposit
     * @return lockPeriod Lock period in seconds
     * @return isActive Whether deposit is active
     */
    function getDeposit(address _user, uint256 _depositId) 
        external 
        view 
        returns (
            uint256 depositId,
            uint256 amount,
            RiskLevel risk,
            uint256 depositTime,
            uint256 lockPeriod,
            bool isActive
        ) 
    {
        Deposit[] storage deposits = userDeposits[_user];
        
        for (uint256 i = 0; i < deposits.length; i++) {
            if (deposits[i].depositId == _depositId) {
                Deposit memory userDeposit = deposits[i];
                return (
                    userDeposit.depositId,
                    userDeposit.amount,
                    userDeposit.risk,
                    userDeposit.depositTime,
                    userDeposit.lockPeriod,
                    userDeposit.isActive
                );
            }
        }
        
        revert("Deposit ID not found");
    }
    
    /**
     * @dev Get all deposits for a user
     * @param _user User address
     * @return Array of all user's deposits
     */
    function getUserDeposits(address _user) external view returns (Deposit[] memory) {
        return userDeposits[_user];
    }
    
    /**
     * @dev Get all active deposits for a user
     * @param _user User address
     * @return Array of active deposits
     */
    function getActiveDeposits(address _user) external view returns (Deposit[] memory) {
        Deposit[] storage allDeposits = userDeposits[_user];
        uint256 activeCount = 0;
        
        // Count active deposits
        for (uint256 i = 0; i < allDeposits.length; i++) {
            if (allDeposits[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active deposits
        Deposit[] memory activeDeposits = new Deposit[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < allDeposits.length; i++) {
            if (allDeposits[i].isActive) {
                activeDeposits[currentIndex] = allDeposits[i];
                currentIndex++;
            }
        }
        
        return activeDeposits;
    }
    
    /**
     * @dev Check if deposit lock period has expired
     * @param _user User address
     * @param _depositId Deposit ID to check
     * @return bool True if lock period expired
     */
    function isLockPeriodExpired(address _user, uint256 _depositId) external view returns (bool) {
        Deposit[] storage deposits = userDeposits[_user];
        
        for (uint256 i = 0; i < deposits.length; i++) {
            if (deposits[i].depositId == _depositId) {
                if (!deposits[i].isActive) return false;
                return block.timestamp >= deposits[i].depositTime + deposits[i].lockPeriod;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Get USDC balance held by contract
     * @return uint256 USDC balance
     */
    function getContractBalance() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }
    
    /**
     * @dev Emergency withdrawal of USDC by owner (only if no active deposits)
     */
    function emergencyWithdraw() external onlyOwner {
        require(totalDeposits == 0, "Cannot withdraw while deposits are active");
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        
        require(usdcToken.transfer(owner, balance), "USDC transfer failed");
    }
    
    /**
     * @dev Update USDC token address (use with extreme caution)
     * @param _newUsdcToken New USDC token contract address
     */
    function updateUsdcToken(address _newUsdcToken) external onlyOwner {
        require(_newUsdcToken != address(0), "Invalid address");
        require(totalDeposits == 0, "Cannot change USDC token while deposits are active");
        usdcToken = IERC20(_newUsdcToken);
    }
    
    /**
     * @dev Transfer ownership
     * @param _newOwner New owner address
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
}
