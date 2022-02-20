import type { NextPage } from "next";
import Router from "next/router";
import { useEffect, useContext, useState } from "react";
import { useContract, useSigner } from "wagmi";

import { LoanContext } from "../lib/context";
import contracts from "../constants/contracts";
import lendingPoolABI from "../constants/lendingpool.json";

import LitJsSdk from "lit-js-sdk";
import LenderLoans from "./lender";

const Dashboard: NextPage = () => {
  const { loan, setLoan } = useContext(LoanContext);
  const [ isLender, setIsLender ] = useState<boolean>(false);
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
  }

  const onOldLoan = () => {
    Router.push("/loans");
  }
  
  useEffect(() => {
    checkUserIsLender();
  }, [signer])

  const checkUserIsLender = async () => {
    if (signer) {
      const connectedAddress = await signer.getAddress();
      const owner = await contract.owner();
      console.log(owner);
  
      setIsLender(connectedAddress == owner);
    }
  }

  const userScreen = <>
    <div className='grid grid-cols-2 gap-4 p-5'>
        {!isLender && <><div className="content-center items-center">
            <h3>Your Open loans</h3>
            <p>View, manage and repay your loans</p>
            <button onClick={onOldLoan} className="btn btn-primary btn-lg">Existing Loans</button>
        </div>
        <div className="content-center items-center">
            <h3>Open a new loan</h3>
            <p>Take out a new loan by escrowing your identity</p>
            <button onClick={onNewLoan} className="btn btn-primary btn-lg">New Loan</button>
        </div></>}
    </div>
  </>

  return (
    <>
      <h1 className="mb-4">Dashboard</h1>
      {userScreen}
    </>
  );
};

export default Dashboard;
