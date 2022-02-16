// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./IERC20.sol";

struct Loan {
    uint256 totalAmountDue;
    uint256 maturity;
}

// TODO: Add contract owner who will receive permission to access data vault
// TODO: Add function to withdraw funds as contract owner
contract LendingPool {
    IERC20 public asset;
    uint256 public PERCENTAGE_INTEREST = 10; // 10% interest
    uint256 public MAX_LOAN_DURATION = 31556926 * 2; // 2 years

    mapping(address => Loan) public loans;

    // Pass the address of the ERC20 token that will be lent.
    // This contract must be funded with these tokens so they can be lent.
    constructor(address asset_) {
        asset = IERC20(asset_);
    }

    // Convenience function, it returns the balance of tokens this contract has.
    function lendingPoolBalance() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    // Returns whether a borrower has defaulted on their loan.
    // Meaning the maturity has passed and there's still some amount due.
    function hasDefaulted(address borrower) public view returns (bool) {
        Loan storage loan = loans[borrower];
        return (loan.totalAmountDue > 0 && block.timestamp > loan.maturity);
    }

    // Computes the interest based on the amount of a loan
    function computeInterests(uint256 amount) public view returns (uint256) {
        return (PERCENTAGE_INTEREST * amount) / 100;
    }

    // Take out a loan as `msg.sender` for `amount` to be repaid before `maturity`.
    // Requirements:
    // - This contract must have at least `amount` of tokens
    // - Maturity must be in the future and less than MAX_LOAN_DURATION
    // - The sender must not have a loan already
    function borrow(uint256 amount, uint256 maturity) public {
        address sender = msg.sender;
        Loan storage loan = loans[sender];
        require(loan.totalAmountDue == 0, "Repay your current loan first");
        require(maturity > block.timestamp, "Maturity must be in the future");
        require((maturity - block.timestamp) < MAX_LOAN_DURATION, "Loan duration is too long");

        uint256 interests = computeInterests(amount);

        uint256 totaltotalAmountDue = amount + interests;
        loans[sender] = Loan(totaltotalAmountDue, maturity);
        asset.transfer(sender, amount);
    }

    // Repays `amount` of your loan as `msg.sender`.
    // This contract must have enough allowance to transfer `amount` from `msg.sender`.
    // Requirements:
    // - Can't make a repayment after the loan's maturity.
    function repay(uint256 amount) public {
        address sender = msg.sender;
        asset.transferFrom(sender, address(this), amount);
        Loan storage loan = loans[msg.sender];
        require(loan.maturity > block.timestamp, "You missed the deadline :(");

        loan.totalAmountDue -= amount;
    }
}
