// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import '@openzeppelin/contracts/utils/cryptography/EIP712.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

/// @notice Single immutable asset, transfer-only session wallet. All amounts use asset decimals.
contract AgentWallet is EIP712, ReentrancyGuard {
    using SafeERC20 for IERC20;
    address public immutable owner;
    IERC20 public immutable asset;
    bytes32 public constant PAYMENT_TYPEHASH = keccak256('Payment(address session,address recipient,uint256 amount,uint256 nonce,bytes32 requestId,uint256 generation)');
    struct Policy { uint256 perCall; uint256 daily; uint256 expires; uint256 generation; bool active; }
    struct Spend { uint256 time; uint256 amount; }
    mapping(address => Policy) public policies;
    mapping(address => mapping(address => uint256)) private allowed;
    mapping(address => uint256) public nonces;
    mapping(address => Spend[]) private history;
    mapping(address => uint256) private head;
    event SessionGranted(address indexed session,uint256 perCall,uint256 daily,uint256 expires,uint256 generation);
    event SessionRevoked(address indexed session);
    event Paid(address indexed session,address indexed recipient,uint256 amount,uint256 nonce,bytes32 indexed requestId);
    error OwnerOnly(); error InvalidPolicy(); error SessionInactive(); error SessionExpired();
    error RecipientNotAllowed(); error PerCallExceeded(); error DailyCapExceeded(); error InvalidNonce(); error InvalidSignature();
    modifier onlyOwner() { if(msg.sender != owner) revert OwnerOnly(); _; }
    constructor(address token) EIP712('JebKharch','1') { require(token != address(0)); owner=msg.sender; asset=IERC20(token); }
    function grantSession(address key,uint256 perCall,uint256 daily,uint256 expires,address[] calldata recipients) external onlyOwner {
        if(key==address(0)||perCall==0||daily<perCall||expires<=block.timestamp||recipients.length==0||recipients.length>32) revert InvalidPolicy();
        uint256 generation=policies[key].generation+1;
        policies[key]=Policy(perCall,daily,expires,generation,true);
        for(uint256 i;i<recipients.length;i++) { require(recipients[i]!=address(0)); allowed[key][recipients[i]]=generation; }
        // Spend history deliberately survives regranting so renewal cannot reset the rolling cap.
        emit SessionGranted(key,perCall,daily,expires,generation);
    }
    function revoke(address key) external onlyOwner { policies[key].active=false; emit SessionRevoked(key); }
    function spent24h(address key) public view returns(uint256 sum) {
        Spend[] storage h=history[key];
        for(uint256 i=head[key];i<h.length;i++) if(h[i].time+1 days>block.timestamp) sum+=h[i].amount;
    }
    function isAllowed(address key,address recipient) external view returns(bool) { return allowed[key][recipient]==policies[key].generation && policies[key].generation!=0; }
    function execute(address key,address recipient,uint256 amount,uint256 nonce,bytes32 requestId,bytes calldata sig) external nonReentrant {
        Policy memory p=policies[key];
        if(!p.active) revert SessionInactive();
        if(block.timestamp>=p.expires) revert SessionExpired();
        if(allowed[key][recipient]!=p.generation) revert RecipientNotAllowed();
        if(amount==0||amount>p.perCall) revert PerCallExceeded();
        if(nonce!=nonces[key]) revert InvalidNonce();
        bytes32 digest=_hashTypedDataV4(keccak256(abi.encode(PAYMENT_TYPEHASH,key,recipient,amount,nonce,requestId,p.generation)));
        if(ECDSA.recover(digest,sig)!=key) revert InvalidSignature();
        Spend[] storage h=history[key];
        uint256 start=head[key];
        while(start<h.length && h[start].time+1 days<=block.timestamp) start++;
        head[key]=start;
        uint256 sum;
        for(uint256 i=start;i<h.length;i++) sum+=h[i].amount;
        if(sum+amount>p.daily) revert DailyCapExceeded();
        nonces[key]++; h.push(Spend(block.timestamp,amount));
        asset.safeTransfer(recipient,amount);
        emit Paid(key,recipient,amount,nonce,requestId);
    }
    function withdraw(address recipient,uint256 amount) external onlyOwner nonReentrant { asset.safeTransfer(recipient,amount); }
}
