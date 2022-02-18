import type { NextPage } from "next";
import Router from "next/router";
import { useState, useEffect, useContext } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useContract, useAccount, useSigner, useNetwork } from "wagmi";

import FormData from "../lib/formData";
import FormInput from "../components/formInput";
import { LoanContext, PassportContext } from "../lib/context";
import contracts from "../constants/contracts";
import nftABI from "../constants/nftABI.json";

import LitJsSdk from "lit-js-sdk";

const Dashboard: NextPage = () => {
  const { loan, setLoan } = useContext(LoanContext);

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

  const userScreen = <>
    <div className='grid grid-cols-2 gap-4 p-5'>
        <div className="content-center items-center">
            <h3>Your Open loans</h3>
            <p>View, manage and repay your loans</p>
            <button onClick={onOldLoan} className="btn btn-primary btn-lg">Existing Loans</button>
        </div>
        <div className="content-center items-center">
            <h3>Open a new loan</h3>
            <p>Take out a new loan by escrowing your identity</p>
            <button onClick={onNewLoan} className="btn btn-primary btn-lg">New Loan</button>
        </div>
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
