// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./IERC20.sol";
import "hardhat/console.sol";

struct Loan {
    uint256 totalAmountDue;
    uint256 maturity;
}

// TODO: Add contract owner who will receive permission to access data vault
// TODO: Add function to withdraw funds as contract owner
contract LendingPool {
    uint256 private SECONDS_IN_A_YEAR = 31556952;

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
    function borrow(uint256 amount, uint256 maturity) public {
        address sender = msg.sender;
        Loan storage loan = loans[sender];
        require(loan.totalAmountDue == 0, "Repay your current loan first");

        uint256 loanDuration = maturity - block.timestamp;
        require(loanDuration > 0, "Maturity must be in the future");
        require(loanDuration < MAX_LOAN_DURATION, "Loan duration is too long");

        uint256 totalAmountDue = getTotalAmountDue(amount, loanDuration);

        loans[sender] = Loan(totalAmountDue, maturity);

        asset.transfer(sender, amount);
    }

    // Repays `amount` of your loan as `msg.sender`.
    // This contract must have enough allowance to transfer `amount` from `msg.sender`.
    // Requirements:
    // - Can't make a repayment after the loan's maturity.
    function repay(uint256 amount) public {
        address sender = msg.sender;

        Loan storage loan = loans[msg.sender];
        require(loan.maturity > block.timestamp, "You missed the deadline :(");

        if (amount > loan.totalAmountDue) {
            amount = loan.totalAmountDue;
        }

        asset.transferFrom(sender, address(this), amount);
        loan.totalAmountDue -= amount;
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