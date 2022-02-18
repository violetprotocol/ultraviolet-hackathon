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

const Escrow: NextPage = () => {
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
  }

  const submitPassport = async (owner: string, id: number) => {
    const client = new LitJsSdk.LitNodeClient();
    await client.connect();

    const { symmetricKey, encryptedZip } = await LitJsSdk.zipAndEncryptFiles([file])

    const accessControlConditions = [
      {
        contractAddress: contracts.nft,
        standardContractType: 'ERC721',
        chain: networkData.chain?.name.toLowerCase(),
        method: 'ownerOf',
        parameters: [id.toString()],
        returnValueTest: {
          comparator: '==',
          value: owner
        }
      }
    ]

    const authSig = await LitJsSdk.checkAndSignAuthMessage({chain: networkData.chain?.name.toLowerCase()})
    
    const encryptedSymmetricKey = await window.litNodeClient.saveEncryptionKey({
      accessControlConditions,
      symmetricKey,
      authSig,
      chain: networkData.chain?.name.toLowerCase()
    })

    const encryptedZipB64 = Buffer.from(await encryptedZip.arrayBuffer()).toString('base64');

    fetch("http://localhost:8080/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include" as RequestCredentials,
      body: JSON.stringify({
        nftId: id.toString(),
        encryptedFile: encryptedZipB64,
        encryptedSymmetricKey: encryptedSymmetricKey,
        accessControlConditions: accessControlConditions
      }),
    }).then(async (response) => {
      console.log(response.text());
      Router.push("/borrow");
    });
  }

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
      <h1 className="mb-4">Escrow your Identity</h1>
        <p>Upload your official document identifying you and you will be minted an NFT that grants access to it.</p>
        <p>Escrow it in your contract with the lender and it is revealed to the lender in case of default.</p>

        <br/>
        <br/>
        <br/>
        <h3>Upload your passport.</h3>
        <div className="centerContent pt-0 mt-0">
          <input type="file" onChange={handleFile}/>
        </div>

        <div className="centerContent pt-0 mt-0">
          <button onClick={onMint} className="btn btn-primary btn-lg">
            Mint ID NFT
          </button>
        </div>
    </>
  );
};

export default Escrow;
