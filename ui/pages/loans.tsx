import { BigNumber, utils } from "ethers";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useContract, useSigner } from "wagmi";
import CardTable from "../components/Cards/CardTable";
import contracts from "../constants/contracts";
import lendingPoolABI from "../constants/lendingpool.json";

const normalizeLoan = (loan, defaulted) => {
  // not a valid loan if maturity is 0
  if (loan.maturity.eq(0)) {
    return null;
  }
  const maturity = loan?.maturity?.toString();
  const tokenId = loan?.tokenId?.toNumber();
  const totalAmountDue = utils.formatUnits(loan?.totalAmountDue, 18);
  return {
    maturity,
    totalAmountDue,
    tokenId,
    defaulted,
  };
};

const rawMockLoan = {
  maturity: BigNumber.from("1676790455"),
  totalAmountDue: BigNumber.from("110000000000000000000"),
  tokenId: BigNumber.from("11"),
};
const mockLoan = normalizeLoan(rawMockLoan, false);

const Loans: NextPage = () => {
  const [{ data: signer, error, loading }] = useSigner();
  const [currentLoan, setCurrentLoan] = useState(null);

  const contract = useContract({
    addressOrName: contracts.lendingPool,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    contractInterface: lendingPoolABI.abi,
    signerOrProvider: signer,
  });

  useEffect(() => {
    const getLoans = async () => {
      if (!signer) {
        return;
      }
      const connectedAddress = signer.getAddress();
      console.log("connectedAddress", connectedAddress);
      const loan = await contract.loans(connectedAddress);
      console.log("loan", loan);
      if (!loan) {
        return;
      }
      const defaulted = await contract.hasDefaulted(connectedAddress);

      const normalizedLoan = normalizeLoan(loan, defaulted);

      setCurrentLoan(normalizedLoan);
    };
    getLoans();
  }, [contract, signer]);

  return (
    <>
      <div style={{ maxWidth: "80%" }}>
        <CardTable title={"Your Loans"} loans={[mockLoan]} />
      </div>
    </>
  );
};

export default Loans;
