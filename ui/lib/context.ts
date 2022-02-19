import { BigNumber } from "ethers";
import { createContext } from "react";

export interface LoanInterface {
  borrowerAddr: string;
  lenderAddr: string;
  amount: BigNumber;
  maturity: number;
  nftId: number;
}

export interface PassportInterface {
  passportFile: Buffer
}

export interface BalanceInterface {
  balance: BigNumber,
  decimals: BigNumber
}

export interface LoanContextInterface {
  loan: LoanInterface;
  setLoan: (l: LoanInterface) => void;
}

export interface BalanceContextInterface {
  balance: BalanceInterface;
  setBalance: (b: BalanceInterface) => void;
}

export interface PassportContextInterface {
  passport: PassportInterface;
  setPassport: (p: PassportInterface) => void;
}

export const InitContextValue: LoanInterface = {
  borrowerAddr: "",
  lenderAddr: "0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb",
  amount: BigNumber.from(0),
  maturity: 0,
  nftId: -1,
};

export const InitBalanceContextValue: BalanceInterface = { 
  balance: BigNumber.from(0),
  decimals: BigNumber.from(0)
};

export const LoanContext = createContext<LoanContextInterface>({
  loan: InitContextValue,
  setLoan: null,
});

export const BalanceContext = createContext<BalanceContextInterface>({
  balance: InitBalanceContextValue,
  setBalance: null
});

export const PassportContext = createContext<PassportContextInterface>({
  passport: { passportFile: Buffer.from("") },
  setPassport: null,
});
