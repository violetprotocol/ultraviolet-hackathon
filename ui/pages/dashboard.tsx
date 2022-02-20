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
    fetch("https://api.pinata.cloud/data/testAuthentication", {
      method: "GET",
      headers: { 
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0NjQ2ZmViZS1iZDQ3LTQyNDAtOTYwMC1kZDRlNTMzOWI1NDAiLCJlbWFpbCI6ImNocmlzQHZpb2xldC5jbyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2V9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIxOGQ4ZjRlZjBiNjg4ZjA3ZGIwMiIsInNjb3BlZEtleVNlY3JldCI6IjA3YWZjN2UwZWRiYmM4ZjY1YzQwNDEyY2RhMDg2NDA4NDBhY2M0NDg2NmVjNWY5OWFhNWQ4ZjZkMzQ5ZTAzNGIiLCJpYXQiOjE2NDUzMzQzNDZ9.4k7bf_Lz3ylYMfJ3CCU29ywSm_LYL8YSts6jakZ4kXY" 
      }
    }).then(async (response) => {
      console.log(response.text());
    });
  })

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
