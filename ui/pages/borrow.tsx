import type { NextPage } from "next";
import Router from "next/router";
import { useEffect, useContext } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

import FormData from "../lib/formData";
import FormInput from "../components/formInput";
import { LoanContext } from "../lib/context";

const Borrow: NextPage = () => {
  const { loan, setLoan } = useContext(LoanContext);
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

  const onSubmit: SubmitHandler<FormData> = (data) => {
    // @TODO: this should: Send a post to the back
    loan.amount = data.amount;
    loan.maturity = data.maturity;
    setLoan(loan);
    Router.push("/confirm");
  };

  // const onSubmitPassport = async (passportFile) => {
  //   const { symmetricKey, encryptedZip } = await LitJsSdk.zipAndEncryptFiles([passportFile])
  //   const accessControlConditions = [
  //     {
  //       contractAddress: '0x3110c39b428221012934A7F617913b095BC1078C',
  //       standardContractType: 'ERC721',
  //       chain,
  //       method: 'balanceOf',
  //       parameters: [
  //         ':userAddress',
  //         '9541'
  //       ],
  //       returnValueTest: {
  //         comparator: '>',
  //         value: '0'
  //       }
  //     }
  //   ]
    
  //   const encryptedSymmetricKey = await window.litNodeClient.saveEncryptionKey({
  //     accessControlConditions,
  //     symmetricKey,
  //     authSig,
  //     chain
  //   })
    
  //   // persist encryptedZip, encryptedSymmetricKey and accessControlConditions
  // }

  // const onReveal = () => {
  //   // retrieve encryptedZip, encryptedSymmetricKey and accessControlConditions
  //   const authSig = await LitJsSdk.checkAndSignAuthMessage({chain: 'ethereum'})
    
  //   const symmetricKey = await window.litNodeClient.getEncryptionKey({
  //     accessControlConditions,
  //     // Note, below we convert the encryptedSymmetricKey from a UInt8Array to a hex string.  This is because we obtained the encryptedSymmetricKey from "saveEncryptionKey" which returns a UInt8Array.  But the getEncryptionKey method expects a hex string.
  //     toDecrypt: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16"),
  //     chain,
  //     authSig
  //   })

  //   const decryptedFile = await LitJsSdk.decryptZip(
  //     encryptedZip,
  //     symmetricKey
  //   );
  // }

  return (
    <>
      <h1 className="mb-4">Borrow page</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <h3>1. How much do you want to borrow?</h3>
        <FormInput
          register={register}
          error={errors.amount}
          inputName="amount"
          type="number"
          placeholder={0}
        />

        <h3>2. Select the maturity of your loan.</h3>
        <FormInput
          register={register}
          error={errors.maturity}
          inputName="maturity"
          type="datetime-local"
          placeholder=""
        />

        <div className="centerContent pt-0 mt-0">
          <button type="submit" className="btn btn-primary btn-lg">
            Confirm
          </button>
        </div>
      </form>
    </>
  );
};

export default Borrow;
