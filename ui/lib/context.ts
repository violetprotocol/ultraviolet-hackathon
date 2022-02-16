import { createContext } from "react";

export interface LoanInterface {
  borrowerAddr: string;
  lenderAddr: string;
  amount: number;
  maturity: string;
}

export interface LoanContextInterface {
  loan: LoanInterface;
  setLoan: (l: LoanInterface) => void;
}

export const InitContextValue: LoanInterface = {
  borrowerAddr: "",
  lenderAddr: "0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb",
  amount: 0,
  maturity: "",
};

export const LoanContext = createContext<LoanContextInterface>({
  loan: InitContextValue,
  setLoan: null,
});
