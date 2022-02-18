import type { NextPage } from "next";
import Router from "next/router";
import { useState, useEffect, useContext } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useContract, useAccount, useSigner, useNetwork } from 'wagmi'

import FormData from "../lib/formData";
import FormInput from "../components/formInput";
import { LoanContext, PassportContext } from "../lib/context";
import contracts from "../constants/contracts"
import nftABI from "../constants/nftABI.json"

import LitJsSdk from "lit-js-sdk";

const Loans: NextPage = () => {
  const { loan, setLoan } = useContext(LoanContext);
  const { passport, setPassport } = useContext(PassportContext);
  
  const [file, setFile] = useState()
  const [{ data: networkData, error: networkError, loading: networkLoading }, switchNetwork] = useNetwork()
  const [{ data, error, loading }, getSigner] = useSigner()
  const contract = useContract({
    addressOrName: contracts.nft,
    contractInterface: nftABI,
    signerOrProvider: data
  })

  const [sending, setSending] = useState(false);


  function handleFile(event) {
    setFile(event.target.files[0])
  }

  useEffect(() => {
    if (!loan.borrowerAddr) {
      // Go to index and force user to connect.
      // Once we have a session, shouldn't need this trick.
      Router.push("/");
    }
  }, [loan]);

  // const onReveal = async (id: number) => {
  //   // retrieve encryptedZip, encryptedSymmetricKey and accessControlConditions

  //   const authSig = await LitJsSdk.checkAndSignAuthMessage({chain: networkData.chain?.name.toLowerCase()})

  //   fetch(`http://localhost:8080/api/retrieve/${id}`, {
  //     method: "GET",
  //     headers: { "Content-Type": "application/json" },
  //     credentials: "include" as RequestCredentials
  //   }).then(async (response) => {
  //     console.log(response.json());
  //     Router.push("/borrow");
  //   });
    
    // const symmetricKey = await window.litNodeClient.getEncryptionKey({
    //   accessControlConditions,
    //   // Note, below we convert the encryptedSymmetricKey from a UInt8Array to a hex string.  This is because we obtained the encryptedSymmetricKey from "saveEncryptionKey" which returns a UInt8Array.  But the getEncryptionKey method expects a hex string.
    //   toDecrypt: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16"),
    //   chain,
    //   authSig
    // })

    // const decryptedFile = await LitJsSdk.decryptZip(
    //   encryptedZip,
    //   symmetricKey
    // );
  // }

  return (
    <>
      <h1 className="mb-4">Current Open Loans</h1>
    </>
  );
};

export default Loans;
