import { LoanInterface } from "./context";
import { apy } from "./config";

const getInterval = (loan: LoanInterface): number => {
  const maturityDate = new Date(loan.maturity).getTime();
  const now = new Date().getTime();
  const daysFromNow: number = (maturityDate - now) / (1000 * 60 * 60 * 24);
  //console.log("loan days duration:", daysFromNow);
  const yearsFromNow: number = daysFromNow / 365;
  return yearsFromNow;
};

export const isValidDate = (loan: LoanInterface): boolean => {
  const yearsFromNow: number = getInterval(loan);
  if (10 >= yearsFromNow && yearsFromNow > 0) {
    return true;
  }
  return false;
};

export const computeDue = (loan: LoanInterface): number => {
  const yearsFromNow: number = getInterval(loan);
  const interest: number = 1 + apy;

  const amount: number = +loan.amount;
  const due: number = amount * interest ** yearsFromNow;
  return due;
};

export default computeDue;
