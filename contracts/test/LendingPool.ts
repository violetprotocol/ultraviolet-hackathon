import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";
import type { LendingPool } from "../src/types/LendingPool";
import type { MyToken } from "../src/types/MyToken";
import type { UVNFT } from "../src/types/UVNFT";
import { toBN } from "./utils";

const SECONDS_IN_A_YEAR = 31556952;
const FOUR_WEEKS_IN_SECS = 2419200;
const INITIAL_LENDING_POOL_BALANCE = toBN("1000000"); // 1 million

const oneYearFromNow = Math.ceil(Date.now() / 1000 + SECONDS_IN_A_YEAR);

const increaseEVMTime = async (time: number) => {
  await ethers.provider.send("evm_increaseTime", [time]);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await ethers.provider.send("evm_mine");
};

describe("LendingPool", function () {
  let lendingPool: LendingPool;
  let assetToken: MyToken;
  let uvNFT: UVNFT;
  let owner: SignerWithAddress;
  let borrower: SignerWithAddress;
  let tokenId: BigNumber;

  before(async function () {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    owner = signers[0];
    borrower = signers[1];
  });

  beforeEach(async function () {
    const MyTokenArtifact: Artifact = await artifacts.readArtifact("MyToken");
    assetToken = <MyToken>await waffle.deployContract(owner, MyTokenArtifact);

    const UVNFTArtifact: Artifact = await artifacts.readArtifact("UVNFT");
    uvNFT = <UVNFT>await waffle.deployContract(owner, UVNFTArtifact);
    const LendingPoolArtifact: Artifact = await artifacts.readArtifact("LendingPool");
    lendingPool = <LendingPool>(
      await waffle.deployContract(owner, LendingPoolArtifact, [assetToken.address, uvNFT.address])
    );

    await assetToken.mint(lendingPool.address, INITIAL_LENDING_POOL_BALANCE);

    await uvNFT.connect(owner).safeMint(borrower.address);

    tokenId = await uvNFT.tokenOfOwnerByIndex(borrower.address, toBN("0"));

    // Approve lendingPool to transfer the UV NFT
    await uvNFT.connect(borrower).approve(lendingPool.address, tokenId);
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
    it("should register the right total amount due with interest", async () => {
      const borrowedAmount = toBN("100");
      // Maturity is 1 year from now
      const maturity = Math.ceil(Date.now() / 1000 + SECONDS_IN_A_YEAR);

      await lendingPool.connect(borrower).borrow(borrowedAmount, maturity, tokenId);

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
      await lendingPool.connect(borrower).borrow(borrowedAmount, maturity, tokenId);

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
      await lendingPool.connect(borrower).borrow(borrowedAmount, maturity, tokenId);

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
      await lendingPool.connect(borrower).borrow(borrowedAmount, maturity, tokenId);

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

  describe("NFT transfers", () => {
    const borrowedAmount = toBN("100");
    it("should transfer a UV NFT to the lending pool when taking out a loan", async () => {
      await lendingPool.connect(borrower).borrow(borrowedAmount, oneYearFromNow, tokenId);

      expect(await uvNFT.ownerOf(tokenId)).to.eq(lendingPool.address);
    });

    it("should transfer back the NFT when repaying the loan", async () => {
      await lendingPool.connect(borrower).borrow(borrowedAmount, oneYearFromNow, tokenId);

      // Prerequisites for repayment
      // mint more tokens to borrower
      await assetToken.mint(borrower.address, toBN("2000"));
      const loan = await lendingPool.loans(borrower.address);
      const totalAmountDue = loan.totalAmountDue;
      await assetToken.connect(borrower).approve(lendingPool.address, totalAmountDue);

      // Full repayment
      await lendingPool.connect(borrower).repay(totalAmountDue);

      expect(await uvNFT.ownerOf(tokenId)).to.eq(borrower.address);
    });

    it("should transfer the NFT to the contract owner in case of default", async () => {
      const feb262022 = 1645897312;
      await lendingPool.connect(borrower).borrow(borrowedAmount, feb262022, tokenId);

      await increaseEVMTime(FOUR_WEEKS_IN_SECS);

      // borrower has defaulted
      expect(await lendingPool.hasDefaulted(borrower.address)).to.be.true;
      // Lending Pool is still the NFT owner
      expect(await uvNFT.ownerOf(tokenId)).to.eq(lendingPool.address);

      await lendingPool.connect(owner).unlockIdentityEscrow(borrower.address);

      // Lender has the NFT
      expect(await uvNFT.ownerOf(tokenId)).to.eq(owner.address);
    });
  });
});
