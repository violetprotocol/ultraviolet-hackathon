import type { NextPage } from "next";
import Router from "next/router";
import { useContext, useEffect, useState } from "react";
import { useContract, useSigner } from "wagmi";
import contracts from "../constants/contracts";
import lendingPoolABI from "../constants/lendingpool.json";
import { LoanContext } from "../lib/context";

const Dashboard: NextPage = () => {
  const { loan, setLoan } = useContext(LoanContext);
  const [isLender, setIsLender] = useState<boolean>(false);
  const [{ data: signer, error, loading }, getSigner] = useSigner();
  const contract = useContract({
    addressOrName: contracts.lendingPool,
    contractInterface: lendingPoolABI.abi,
    signerOrProvider: signer,
  });

  useEffect(() => {
    if (!loan.borrowerAddr) {
      // Go to index and force user to connect.
      // Once we have a session, shouldn't need this trick.
      Router.push("/");
    }
  }, [loan]);

  const onNewLoan = () => {
    Router.push("/escrow");
  };

  const onOldLoan = () => {
    Router.push("/loans");
  };

  useEffect(() => {
    checkUserIsLender();
  }, [signer]);

  const checkUserIsLender = async () => {
    if (signer) {
      const connectedAddress = await signer.getAddress();
      const owner = await contract.owner();
      console.log(owner);

      setIsLender(connectedAddress == owner);
    }
  };

  useEffect(() => {
    if (isLender) {
      Router.push("/lender");
    }
  }, [isLender]);

  const userScreen = (
    <div className="flex p-5 mt-8">
      {!isLender && (
        <>
          <div className="content-center items-center px-4">
            <button
              onClick={onOldLoan}
              className="glowing-button-blue uppercase my-8"
            >
              Existing Loans
            </button>
            <p className="font-teletactile my-6">
              View, manage and repay your loans
            </p>
          </div>
          <div className="content-center items-center px-4">
            <button
              onClick={onNewLoan}
              className="glowing-button-pink uppercase my-8"
            >
              New Loan
            </button>
            <p className="font-teletactile my-6 max-w-md text-center">
              Take out a new loan by escrowing your identity
            </p>
          </div>
        </>
      )}
    </div>
  );

  return <>{userScreen}</>;
};

export default Dashboard;
