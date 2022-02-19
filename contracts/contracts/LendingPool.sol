// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


struct Loan {
    uint256 totalAmountDue; // principle + interests
    uint256 maturity; // as unix timestamp in seconds
    uint256 tokenId; // reference to the NFT token id used to grant access to the user's conditional data vault
}

contract LendingPool is Ownable, IERC721Receiver {
    uint256 private SECONDS_IN_A_YEAR = 31556952;

    IERC20 public asset;
    // NFT contract for access control to identity escrow
    IERC721 public uvNFT;
    uint256 public PERCENTAGE_INTEREST = 10; // 10% interest
    uint256 public MAX_LOAN_DURATION = 31556926 * 2; // 2 years

    address[] public borrowers;
    mapping(address => Loan) public loans;

    // Emitted when an ERC721 NFT is received
    event Received(address operator, address from, uint256 tokenId, bytes data);

    // Pass the address of the ERC20 token that will be lent.
    // This contract must be funded with these tokens so they can be lent.
    // NFT address on Kovan: 0xb5825059842313F98e82e54Da0186d9771438ab3
    constructor(address asset_, address uvNFT_) {
        asset = IERC20(asset_);
        uvNFT = IERC721(uvNFT_);
    }

    function withdrawAllAssets() external onlyOwner {
        asset.transfer(owner(), asset.balanceOf(address(this)));
    }

    function setNFTAddress(address newAddress) external onlyOwner {
        uvNFT = IERC721(newAddress);
    }

     function setAssetAddress(address newAddress) external onlyOwner {
        asset = IERC20(newAddress);
    }

    // Convenience function, it returns the balance of tokens this contract has.
    function lendingPoolBalance() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    function getBorrowers() public view returns (address[] memory) {
        return borrowers;
    }

    // Returns whether a borrower has defaulted on their loan.
    // Meaning the maturity has passed and there's still some amount due.
    function hasDefaulted(address borrower) public view returns (bool) {
        Loan storage loan = loans[borrower];
        return (loan.totalAmountDue > 0 && block.timestamp > loan.maturity);
    }

    // Gives access to the lender if the `borrower` has defaulted by transferring the uvNFT
    function unlockIdentityEscrow(address borrower) external onlyOwner {
        if(hasDefaulted(borrower)) {
            Loan storage loan = loans[borrower];
            uvNFT.safeTransferFrom(address(this), owner(), loan.tokenId);
        }
    }

    function getTotalAmountDue(uint256 amount, uint256 duration) public view returns (uint256) {
        uint256 interestOverAYear = mulDiv(amount, PERCENTAGE_INTEREST, 100);
        uint256 interest = (duration * interestOverAYear) / SECONDS_IN_A_YEAR;

        return amount + interest;
    }

    // Take out a loan as `msg.sender` for `amount` to be repaid before `maturity`.
    // Requirements:
    // - This contract must have at least `amount` of tokens
    // - Maturity must be in the future and less than MAX_LOAN_DURATION
    // - The sender must not have a loan already
    // - The sender must first approve the transfer of tokenId
    function borrow(uint256 amount, uint256 maturity, uint256 tokenId) public {
        address sender = msg.sender;
        Loan storage loan = loans[sender];
        require(loan.totalAmountDue == 0, "Repay your current loan first");

        uint256 loanDuration = maturity - block.timestamp;
        require(loanDuration > 0, "Maturity must be in the future");
        require(loanDuration < MAX_LOAN_DURATION, "Loan duration is too long");

        uint256 totalAmountDue = getTotalAmountDue(amount, loanDuration);

        // fist time loan, add the address to lenders
        if (loan.maturity == 0) {
            borrowers.push(sender);
        }

        loans[sender] = Loan(totalAmountDue, maturity, tokenId);

        asset.transfer(sender, amount);

        uvNFT.safeTransferFrom(sender, address(this), tokenId);
    }

    // Repays `amount` of your loan as `msg.sender`.
    // This contract must have enough allowance to transfer `amount` from `msg.sender`.
    // Requirements:
    // - Can't make a repayment after the loan's maturity.
    function repay(uint256 amount) public {
        address sender = msg.sender;

        Loan storage loan = loans[msg.sender];
        require(loan.maturity > block.timestamp, "You missed the deadline :(");

        // Avoids transferring more that what is owed
        if (amount > loan.totalAmountDue) {
            amount = loan.totalAmountDue;
        }

        asset.transferFrom(sender, address(this), amount);
        loan.totalAmountDue -= amount;

        // Loan is fully repaid, transfers back the NFT.
        if(loan.totalAmountDue == 0) {
            uvNFT.safeTransferFrom(address(this), sender, loan.tokenId);
        }
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public override returns (bytes4) {
        emit Received(operator, from, tokenId, data);
        
        return IERC721Receiver.onERC721Received.selector;
    }

    // Returns x * y / z
    function mulDiv(
        uint256 x,
        uint256 y,
        uint256 z
    ) private pure returns (uint256) {
        uint256 a = x / z;
        uint256 b = x % z; // x = a * z + b
        uint256 c = y / z;
        uint256 d = y % z; // y = c * z + d
        return a * b * z + a * d + b * c + (b * d) / z;
    }
}
