import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "ethers";
import { task } from "hardhat/config";

task("borrow", "borrows", async (_taskArgs, hre) => {
  const LendingPool = await hre.ethers.getContractFactory("LendingPool");
  const lp = LendingPool.attach("0x724239930d07427A13158779060c6fE2493E51fE");

  const res = await lp.borrow(BigNumber.from(10).pow(18).mul(BigNumber.from(10)), 1647726243, 29);
  console.log(res);
  await res.wait();
});
