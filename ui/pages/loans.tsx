import type { NextPage } from "next";
import Router from "next/router";
import { useState, useEffect, useContext } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useContract, useAccount, useSigner, useNetwork } from 'wagmi'

import FormData from "../lib/formData";
import FormInput from "../components/formInput";
import { LoanContext, PassportContext } from "../lib/context";
import contracts from "../constants/contracts"
import lendingPoolABI from "../constants/lendingpool.json"

import LitJsSdk from "lit-js-sdk";

const Loans: NextPage = () => {
  const [{ data: networkData, error: networkError, loading: networkLoading }, switchNetwork] = useNetwork()
  const [{ data, error, loading }, getSigner] = useSigner()
  const contract = useContract({
    addressOrName: contracts.lendingPool,
    contractInterface: lendingPoolABI,
    signerOrProvider: data
  })

  useEffect(() => {

  }, [contract])

  return (
    <>
      <h1 className="mb-4">Current Open Loans</h1>
    </>
  );
};

export default Loans;
