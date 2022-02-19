import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useContract, useAccount, useSigner, useNetwork } from "wagmi";
import contracts from "../constants/contracts";
import nftABI from "../constants/nftABI.json";
import LitJsSdk from "lit-js-sdk";
import JSZip from "jszip";
import FileSaver from "file-saver";

const Reveal: NextPage = () => {
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
      console.log("file decrypted");
      console.log(decryptedFile);
      // console.log(decryptedFile["128img.jpeg"].async("text"));
      const unzipped = await decryptedFile["encryptedAssets/128img.jpeg"].async(
        "blob",
      );
      setImageFile(unzipped);
      const reader = new FileReader();
      reader.readAsDataURL(unzipped);
      reader.onloadend = () => {
        const base64data = reader.result;
        setImgUrl(base64data);
      };
      // Note: Ie and Edge don't support the new File constructor,
      // so it's better to construct blobs and use saveAs(blob, filename)
      // const decryptedImageFile = new File([imageBlob], "doxxedFile.zip", {
      // type: "application/zip",
      // });
      // FileSaver.saveAs(decryptedImageFile);
      // const file = new File(["Hello, world from File!"], "helloworld.txt", {
      // type: "text/plain;charset=utf-8",
      // });
      // FileSaver.saveAs(file);

      // const blob = new Blob([imageBlob], {
      // type: "image/jpeg",
      // });
      // FileSaver.saveAs(blob, "hello worldBlob.txt");
      // FileSaver.saveAs(imageBlob, "imageBlob.jpeg");
      // const decryptedBlob = new Blob([decryptedFile], {
      //   type: "application/zip",
      // });
      // FileSaver.saveAs(decryptedBlob, "doxxedBlob.zip");
      // FileSaver.saveAs(imageBlob);
      // setImageFile(decryptedFile);
      // FileSaver.saveAs(decryptedFile, "doxxedFile.zip");
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

  if (imageFile && imageUrl) {
    return (
      <>
        <p> ImageFilePresent </p>
        <button onClick={() => FileSaver.saveAs(imageFile, "doxxedImage.jpeg")}>
          Download
        </button>
        <img src={imageUrl.toString()} alt="" />
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
