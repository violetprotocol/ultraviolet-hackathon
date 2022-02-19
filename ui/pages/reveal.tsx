import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useContract, useAccount, useSigner, useNetwork } from "wagmi";
import contracts from "../constants/contracts";
import nftABI from "../constants/nftABI.json";
import LitJsSdk from "lit-js-sdk";
import JSZip from "jszip";

const Reveal: NextPage = () => {
  const [{ data, error, loading }, getSigner] = useSigner();
  const [imageFile, setImageFile] = useState<Blob>();
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
    fetch("http://localhost:8080/api/retrieve?nftId=25", {
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
      console.log(decryptedFile);
      console.log(decryptedFile["encryptedAssets/128img.jpeg"]);
      // const zip = new JSZip();
      // const unzipped = await zip.loadAsync(decryptedFile["encryptedAssets/"]);
      // console.log(unzipped);
      // console.log(unzipped.files);
      const binaryData = [];
      binaryData.push(decryptedFile["encryptedAssets/128img.jpeg"]);
      setImageFile(new Blob(binaryData, { type: "application/zip" }));
    });
  }, []);

  function convertBase64ToBlob(base64Image: string) {
    // Split into two parts
    const parts = base64Image.split(";base64,");

    // Hold the content type
    const imageType = parts[0].split(":")[1];

    // Decode Base64 string
    const decodedData = window.atob(parts[1]);

    // Create UNIT8ARRAY of size same as row data length
    const uInt8Array = new Uint8Array(decodedData.length);

    // Insert all character code into uInt8Array
    for (let i = 0; i < decodedData.length; ++i) {
      uInt8Array[i] = decodedData.charCodeAt(i);
    }

    // Return BLOB image after conversion
    return new Blob([uInt8Array], { type: imageType });
  }

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

  if (imageFile) {
    console.log(imageFile);
    const imageSrc = URL.createObjectURL(imageFile);
    return (
      <>
        <p> ImageFilePresent </p>
        <img src={imageSrc} />
      </>
    );
  }

  return (
    <>
      <h1 className="mb-4">Reveal page</h1>
    </>
  );
};

export default Reveal;
