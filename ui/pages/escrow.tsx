import LitJsSdk from "lit-js-sdk";
import type { NextPage } from "next";
import Router from "next/router";
import { useContext, useEffect, useState } from "react";
import { useContract, useNetwork, useSigner } from "wagmi";
import contracts from "../constants/contracts";
import nftABI from "../constants/nftABI.json";
import { LoanContext } from "../lib/context";

const Escrow: NextPage = () => {
  const { loan, setLoan } = useContext(LoanContext);

  const [file, setFile] = useState();
  const [{ data: networkData }] = useNetwork();
  const [{ data }, getSigner] = useSigner();
  const contract = useContract({
    addressOrName: contracts.nft,
    contractInterface: nftABI.abi,
    signerOrProvider: data,
  });

  const [nftId, setNftId] = useState<number>();
  const [needsApproval, setNeedsApproval] = useState(true);

  function handleFile(event) {
    setFile(event.target.files[0]);
  }

  useEffect(() => {
    checkApproval();
  });

  useEffect(() => {
    if (nftId && !needsApproval) {
      Router.push("/borrow");
    }
  }, [nftId, needsApproval]);

  useEffect(() => {
    if (!loan.borrowerAddr) {
      // Go to index and force user to connect.
      // Once we have a session, shouldn't need this trick.
      Router.push("/");
    }
  }, [loan]);

  const checkApproval = async () => {
    if (nftId) {
      const approved = await contract.callStatic.getApproved(nftId);
      setNeedsApproval(approved != contracts.lendingPool);
    }
  };

  const onMint = async () => {
    const address = await (await getSigner()).getAddress();
    const index = await contract.callStatic.totalSupply();
    try {
      const res = await contract.safeMint(address);
      await res.wait();

      setNftId(index);
      setLoan({ ...loan, nftId: index.toNumber() });

      await submitPassport(address, index);
    } catch (err) {
      console.log(err);
    }
  };

  const onApprove = async () => {
    const res = await contract.approve(contracts.lendingPool, nftId);
    await res.wait();

    await checkApproval();
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
          comparator: "=",
          value: ":userAddress",
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

    console.log(encryptedSymmetricKey);
    const hexEncryptedSymmetricKey = LitJsSdk.uint8arrayToString(
      encryptedSymmetricKey,
      "base16",
    );

    const encryptedZipB64 = Buffer.from(
      await encryptedZip.arrayBuffer(),
    ).toString("base64");

    // fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    //   method: "POST",
    //   headers: {
    //     "Authorization": "Bearer ",
    //     "Content-Type": "application/json"
    //   },
    //   body: JSON.stringify({
    //     pinataContent: {
    //       base64EncryptedFile: encryptedZipB64
    //     }
    //   })
    // }).then(async (response) => {
    //   const result = await response.json();
    //   const ipfsHash = result.IpfsHash;
    //   console.log(ipfsHash);
    // }).catch(async (error) => {
    //   console.log(error);
    // })

    fetch("http://localhost:8080/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include" as RequestCredentials,
      body: JSON.stringify({
        nftId: id.toString(),
        encryptedFile: encryptedZipB64,
        encryptedSymmetricKey: hexEncryptedSymmetricKey,
        accessControlConditions: accessControlConditions,
      }),
    }).then(async (response) => {
      console.log(response.text());
    });
  };

  return (
    <>
      <h1 style={{ fontSize: "30px" }}>
        <i className="neon-green">Escrow your Identity</i>
      </h1>
      <br />
      <br />
      <div className="text-center mt-3 mb-8" style={{ maxWidth: "60%" }}>
        <h2 className="title font-teletactile" style={{ fontSize: "13px" }}>
          Upload your official document identifying you and you will be minted
          an NFT that grants access to it.
        </h2>

        <br />
        <h2 className="title font-teletactile" style={{ fontSize: "13px" }}>
          Escrow it in your contract with the lender and it is revealed to the
          lender in case of default.
        </h2>
      </div>

      <br />
      <br />
      <br />
      {!nftId && (
        <div className="mt-8 mb-4">
          <h2 className="title font-teletactile" style={{ fontSize: "20px" }}>
            Upload your document
          </h2>
          <br />
          <div className="centerContent pt-0 mt-0">
            <input className="text-sm" type="file" onChange={handleFile} />
          </div>
        </div>
      )}

      {!nftId && (
        <div className="centerContent pt-0 mt-0">
          <button
            onClick={onMint}
            className="glowing-button-blue uppercase my-8"
          >
            Mint UV NFT
          </button>
        </div>
      )}

      {nftId && (
        <div className="centerContent pt-0 mt-0">
          <h1 style={{ fontSize: "25px" }}>
            <i className="neon-blue">Minted with ID {nftId.toString()}!</i>
          </h1>
        </div>
      )}

      {nftId && needsApproval && (
        <div className="centerContent pt-0 mt-0">
          <button
            onClick={onApprove}
            className="glowing-button-pink uppercase my-8"
          >
            Approve Lending Pool
          </button>
        </div>
      )}

      {nftId && !needsApproval && (
        <div className="centerContent pt-0 mt-0">
          <h3>Approved for escrow!</h3>
        </div>
      )}
    </>
  );
};

export default Escrow;
