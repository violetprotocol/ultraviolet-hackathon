import { BigNumber, utils } from "ethers";
import type { NextPage } from "next";
import Router from "next/router";
import { useEffect, useState } from "react";
import { useContract, useSigner } from "wagmi";
import CardTable from "../components/Cards/CardTable";
import contracts from "../constants/contracts";
import lendingPoolABI from "../constants/lendingpool.json";
import { NormalizedLoan } from "../lib/types";

const normalizeLoan = (loan, defaulted): NormalizedLoan => {
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

const LenderLoans: NextPage = () => {
  const [{ data: signer, error, loading }, getSigner] = useSigner();
  const contract = useContract({
    addressOrName: contracts.lendingPool,
    contractInterface: lendingPoolABI.abi,
    signerOrProvider: signer,
  });

  const [loans, setLoans] = useState<NormalizedLoan[]>();
  const [isTxPending, setIsTxPending] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    getLoans();
  }, [contract, signer]);

  const getLoans = async () => {
    if (!signer) {
      return;
    }
    setIsFetching(true);

    const connectedAddress = await signer.getAddress();
    const owner = await contract.owner();

    if (connectedAddress != owner) {
      Router.push("/dashboard");
    }

    const borrowers = await contract.getBorrowers();

    const loansPromises = borrowers.map(async (borrower) => {
      const loan = await contract.loans(borrower);
      const defaulted = await contract.hasDefaulted(connectedAddress);
      const normalizedLoan = normalizeLoan(loan, defaulted);
      return normalizedLoan;
    })

    const fetchedLoans = await Promise.all(loansPromises);
    console.log(fetchedLoans);

    setIsFetching(false);
    setLoans(fetchedLoans);
  };

  const onDoxx = async () => {
    setIsTxPending(true);

    

    setIsTxPending(false);
  }

  return (
    <>
    <h1 className="mb-4">Open Loans</h1>
      <div style={{ maxWidth: "80%" }}>
        <CardTable 
          title={"Current Loans"}
          isFetching={isFetching}
          loans={loans}
          onButtonClick={onDoxx}
          isTxPending={isTxPending}
          buttonText={{pending: "Pending...", default: "Doxx ☠️"}}
          isLender={true}/>
      </div>
    </>
  );
};

export default LenderLoans;
