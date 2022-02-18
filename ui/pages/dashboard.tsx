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
  const { passport, setPassport } = useContext(PassportContext);

  const [file, setFile] = useState();
  const [
    { data: networkData, error: networkError, loading: networkLoading },
    switchNetwork,
  ] = useNetwork();
  const [{ data, error, loading }, getSigner] = useSigner();
  const contract = useContract({
    addressOrName: contracts.nft,
    contractInterface: nftABI,
    signerOrProvider: data,
  });

  const [sending, setSending] = useState(false);

  function handleFile(event) {
    setFile(event.target.files[0]);
  }

  useEffect(() => {
    if (!loan.borrowerAddr) {
      // Go to index and force user to connect.
      // Once we have a session, shouldn't need this trick.
      Router.push("/");
    }
  }, [loan]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onMint = async () => {
    setSending(true);
    const address = await (await getSigner()).getAddress();
    const index = await contract.callStatic.totalSupply();
    const res = await contract.mint(index, address);
    await res.wait();

    await submitPassport(address, index);

    setSending(false);
  };

  const submitPassport = async (owner: string, id: number) => {
    const client = new LitJsSdk.LitNodeClient();
    await client.connect();

    const { symmetricKey, encryptedZip } = await LitJsSdk.zipAndEncryptFiles([
      file,
    ]);

    const accessControlConditions = [
      {
        contractAddress: contracts.nft,
        standardContractType: "ERC721",
        chain: networkData.chain?.name.toLowerCase(),
        method: "ownerOf",
        parameters: [id.toString()],
        returnValueTest: {
          comparator: "==",
          value: owner,
        },
      },
    ];

    const authSig = await LitJsSdk.checkAndSignAuthMessage({
      chain: networkData.chain?.name.toLowerCase(),
    });

    const encryptedSymmetricKey = await window.litNodeClient.saveEncryptionKey({
      accessControlConditions,
      symmetricKey,
      authSig,
      chain: networkData.chain?.name.toLowerCase(),
    });

    const encryptedZipB64 = Buffer.from(
      await encryptedZip.arrayBuffer(),
    ).toString("base64");

    fetch("http://localhost:8080/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include" as RequestCredentials,
      body: JSON.stringify({
        nftId: id.toString(),
        encryptedFile: encryptedZipB64,
        encryptedSymmetricKey: encryptedSymmetricKey.toString(),
        accessControlConditions: accessControlConditions,
      }),
    }).then(async (response) => {
      console.log(response.text());
      Router.push("/borrow");
    });
  };

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
