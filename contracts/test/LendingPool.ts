import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";
import type { LendingPool } from "../src/types/LendingPool";
import type { MyToken } from "../src/types/MyToken";
import { toBN } from "./utils";

const SECONDS_IN_A_YEAR = 31556952;
const INITIAL_LENDING_POOL_BALANCE = toBN("1000000"); // 1 million

describe("LendingPool", function () {
  let lendingPool: LendingPool;
  let assetToken: MyToken;
  let owner: SignerWithAddress;
  let borrower: SignerWithAddress;

  before(async function () {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    owner = signers[0];
    borrower = signers[1];
  });

  beforeEach(async function () {
    const MyTokenArtifact: Artifact = await artifacts.readArtifact("MyToken");
    assetToken = <MyToken>await waffle.deployContract(owner, MyTokenArtifact);

    const LendingPoolArtifact: Artifact = await artifacts.readArtifact("LendingPool");
    lendingPool = <LendingPool>await waffle.deployContract(owner, LendingPoolArtifact, [assetToken.address]);

    await assetToken.mint(lendingPool.address, INITIAL_LENDING_POOL_BALANCE);
  });

  describe("getTotalAmountDue", () => {
    it("should add 10 % interest for a 1 year loan", async () => {
      const borrowedAmount = toBN("100");

      const totalAmountDue = await lendingPool.getTotalAmountDue(borrowedAmount, SECONDS_IN_A_YEAR);

      expect(totalAmountDue).to.eq(toBN("110"));
    });

    it("should add 10 % interest for a 2 year loan", async () => {
      const borrowedAmount = toBN("100");

      const totalAmountDue = await lendingPool.getTotalAmountDue(borrowedAmount, SECONDS_IN_A_YEAR * 2);

      expect(totalAmountDue).to.eq(toBN("120"));
    });

    it("should add 10 % interest for a 6 months loan", async () => {
      const borrowedAmount = toBN("100");

      const totalAmountDue = await lendingPool.getTotalAmountDue(borrowedAmount, SECONDS_IN_A_YEAR / 2);

      expect(totalAmountDue).to.eq(toBN("105"));
    });

    it("should add 10 % interest for a 1 min loan", async () => {
      const borrowedAmount = toBN("10000000000");
      const oneMinuteInSeconds = toBN("60", 0);
      const interestOverAYear = borrowedAmount.div(10);

      const interest = oneMinuteInSeconds.mul(interestOverAYear).div(SECONDS_IN_A_YEAR);

      const totalAmountDue = await lendingPool.getTotalAmountDue(borrowedAmount, oneMinuteInSeconds);

      expect(totalAmountDue).to.eq(borrowedAmount.add(interest));
    });
  });

  describe("borrow", () => {
    it("should compute the right amount due with interest", async () => {
      const borrowedAmount = toBN("100");
      // Maturity is 1 year from now
      const maturity = Math.ceil(Date.now() / 1000 + SECONDS_IN_A_YEAR);

      await lendingPool.connect(borrower).borrow(borrowedAmount, maturity);

      const loan = await lendingPool.loans(borrower.address);

      // 0.00001 tokens
      const delta = 10000000000000;
      expect(loan.totalAmountDue).to.be.closeTo(toBN("110"), delta);
    });
  });

  describe("repay", () => {
    const borrowedAmount = toBN("1000");
    const maturity = 1676655712;

    beforeEach(async () => {
      await assetToken.connect(borrower).approve(lendingPool.address, toBN("1000000000"));
    });

    it("should let users partially repay", async () => {
      const repaidAmount = toBN("477");
      // borrow
      await lendingPool.connect(borrower).borrow(borrowedAmount, maturity);

      const loan = await lendingPool.loans(borrower.address);
      const totalAmountDueBeforePartialRepayment = loan.totalAmountDue;

      //repay
      await lendingPool.connect(borrower).repay(repaidAmount);

      expect((await lendingPool.loans(borrower.address)).totalAmountDue).to.eq(
        totalAmountDueBeforePartialRepayment.sub(repaidAmount),
      );
    });

    it("should let users fully repay", async () => {
      // mint more tokens to borrower
      await assetToken.mint(borrower.address, toBN("2000"));

      // borrow
      await lendingPool.connect(borrower).borrow(borrowedAmount, maturity);

      const loan = await lendingPool.loans(borrower.address);
      const totalAmountDueBeforeRepayment = loan.totalAmountDue;

      //repay
      await lendingPool.connect(borrower).repay(totalAmountDueBeforeRepayment);

      expect((await lendingPool.loans(borrower.address)).totalAmountDue).to.eq(0);
    });

    it("should let users fully repay when calling repay with a higher amount", async () => {
      // mint more tokens to borrower
      await assetToken.mint(borrower.address, toBN("2000"));

      // borrow
      await lendingPool.connect(borrower).borrow(borrowedAmount, maturity);

      const loan = await lendingPool.loans(borrower.address);
      const totalAmountDueBeforeRepayment = loan.totalAmountDue;

      const balanceBeforeRepayment = await assetToken.balanceOf(borrower.address);
      //repay
      await lendingPool.connect(borrower).repay(totalAmountDueBeforeRepayment.add(toBN("100")));

      const balanceAfterRepayment = await assetToken.balanceOf(borrower.address);
      expect(balanceAfterRepayment).to.eq(balanceBeforeRepayment.sub(totalAmountDueBeforeRepayment));
      expect((await lendingPool.loans(borrower.address)).totalAmountDue).to.eq(0);
    });
  });
});
