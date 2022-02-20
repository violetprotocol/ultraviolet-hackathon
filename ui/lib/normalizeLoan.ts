import { utils } from "ethers";
import { NormalizedLoan } from "./types";

export const normalizeLoan = (user, loan, defaulted): NormalizedLoan|null => {
    // not a valid loan if maturity is 0
    if (loan.maturity.eq(0)) {
      return null;
    }
    const borrower = user;
    const maturity = loan?.maturity?.toString();
    const tokenId = loan?.tokenId?.toNumber();
    const totalAmountDue = utils.formatUnits(loan?.totalAmountDue, 18);
    return {
        borrower,
        maturity,
        totalAmountDue,
        tokenId,
        defaulted,
    };
  };