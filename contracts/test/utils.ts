import { BigNumberish } from "ethers";
import { ethers } from "hardhat";

export const toBN = (units: string, decimalPlaces: number = 18) => ethers.utils.parseUnits(units, decimalPlaces);
export const formatBN = (amount: BigNumberish, decimalPlaces: number = 18) =>
  ethers.utils.formatUnits(amount, decimalPlaces);
