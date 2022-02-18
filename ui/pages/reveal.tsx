import type { NextPage } from "next";
import { useEffect } from "react";
import { useContract, useAccount, useSigner, useNetwork } from "wagmi";
import contracts from "../constants/contracts";
import nftABI from "../constants/nftABI.json";
import LitJsSdk from "lit-js-sdk";

const Reveal: NextPage = () => {
  const [{ data, error, loading }, getSigner] = useSigner();
  const [
    { data: networkData, error: networkError, loading: networkLoading },
    switchNetwork,
  ] = useNetwork();
  const contract = useContract({
    addressOrName: contracts.nft,
    contractInterface: nftABI.abi,
    signerOrProvider: data,
  });

  useEffect(() => {
    console.log("fetch");
    fetch("http://localhost:8080/api/retrieve?nftId=17", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include" as RequestCredentials,
    }).then(async (response) => {
      console.log(await response.json());
      const authSignature = await LitJsSdk.checkAndSignAuthMessage({
        chain: networkData.chain?.name.toLowerCase(),
      });
      const symmetricKey = await window.litNodeClient.getEncryptionKey({
        accessControlConditions,
        // Note, below we convert the encryptedSymmetricKey from a UInt8Array to a hex string.  This is because we obtained the encryptedSymmetricKey from "saveEncryptionKey" which returns a UInt8Array.  But the getEncryptionKey method expects a hex string.
        toDecrypt: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16"),
        chain,
        authSig,
      });
    });
  }, []);

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
      <h1 className="mb-4">Reveal page</h1>
    </>
  );
};

export default Reveal;
