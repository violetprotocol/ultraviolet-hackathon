import { LoanInterface } from "./context";
import { apy } from "./config";

const computeDue = (loan: LoanInterface): number => {
  const maturityDate = new Date(loan.maturity).getTime();
  const now = new Date().getTime();
  const daysFromNow: number = (maturityDate - now) / (1000 * 60 * 60 * 24);
  //console.log("loan days duration:", daysFromNow);
  const yearsFromNow: number = daysFromNow / 365;

  const interest = 1 + apy;
  const due = loan.amount ** (yearsFromNow * interest);
  return due;
};

export default computeDue;
