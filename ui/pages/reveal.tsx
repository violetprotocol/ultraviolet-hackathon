import type { NextPage } from "next";
import { useEffect, useState, FC } from "react";
import { useContract, useAccount, useSigner, useNetwork } from "wagmi";
import contracts from "../constants/contracts";
import nftABI from "../constants/nftABI.json";
import LitJsSdk from "lit-js-sdk";
import JSZip from "jszip";
import FileSaver from "file-saver";
import ReactLoading from "react-loading";

export interface RevealProps {
  nftId: number;
}

export const Reveal: FC<RevealProps> = ({ nftId }) => {
  const [{ data, error, loading }, getSigner] = useSigner();
  const [imageFile, setImageFile] = useState<Blob>();
  const [imageUrl, setImgUrl] = useState<string | ArrayBuffer>();
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
    fetch(`http://localhost:8080/api/retrieve?nftId=${nftId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include" as RequestCredentials,
    }).then(async (response) => {
      const userDataDto = await response.json();
      console.log(userDataDto);
      const authSignature = await LitJsSdk.checkAndSignAuthMessage({
        chain: networkData.chain?.name.toLowerCase(),
      });
      const client = new LitJsSdk.LitNodeClient();
      await client.connect();
      window.litNodeClient = client;
      const symmetricKey = await window.litNodeClient.getEncryptionKey({
        accessControlConditions: userDataDto.accessControlConditions,
        toDecrypt: userDataDto.encryptedSymmetricKey,
        chain: networkData.chain?.name.toLowerCase(),
        authSig: authSignature,
      });
      console.log(symmetricKey);
      const blobFile = base64toBlob(userDataDto.encryptedFile, "octet-stream");
      console.log(blobFile);
      const decryptedFile = await LitJsSdk.decryptZip(blobFile, symmetricKey);
      console.log("file decrypted");
      console.log(decryptedFile);
      const keys = Object.keys(decryptedFile);
      console.log(keys);
      const imageKey = keys[1];
      const unzipped = await decryptedFile[imageKey].async("blob");
      setImageFile(unzipped);
      const reader = new FileReader();
      reader.readAsDataURL(unzipped);
      reader.onloadend = () => {
        const base64data = reader.result;
        setImgUrl(base64data);
      };
    });
  }, [nftId]);

  function base64toBlob(base64Data, contentType) {
    contentType = contentType || "";
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      const begin = sliceIndex * sliceSize;
      const end = Math.min(begin + sliceSize, bytesLength);

      const bytes = new Array(end - begin);
      for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
  }

  if (imageFile && imageUrl) {
    return (
      <>
        <h2 className="title font-teletactile">Identity decrypted, have fun</h2>
        <div className="centerContent">
          <img src={imageUrl.toString()} alt="" />
        </div>
        <div className="centerContent">
          <button
            className="glowing-button-pink"
            onClick={() => FileSaver.saveAs(imageFile, "doxxedImage.jpeg")}
          >
            Download
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="centerContent">
      <ReactLoading type={"bubbles"} color={"#8f00ff"} />
      <h2 className="title font-teletactile">
        Decrypting the identity of a degen
        <span role="img" aria-label="sheep">
          🕵️‍♂️
        </span>
      </h2>
    </div>
  );
};

export default Reveal;
