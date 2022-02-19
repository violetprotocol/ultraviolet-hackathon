import type { NextPage } from "next";
import Router from "next/router";
import { useEffect, useContext } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { erc20ABI, useContract, useSigner } from "wagmi";

import ContractBullets from "../components/contractBullets";
import { ErrorDisplay } from "../components/formInput";
import contracts from "../constants/contracts";
import { BalanceContext, LoanContext } from "../lib/context";
import lendingPoolABI from "../constants/lendingpool.json";

import { BigNumber } from "ethers";

const SentenceToType = "I consent to the terms outlined above";

interface ConsentForm {
  consent: string;
}

const Contract: NextPage = () => {
  const { loan } = useContext(LoanContext);
  const { setBalance } = useContext(BalanceContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConsentForm>();
  const [{ data, error, loading }, getSigner] = useSigner();
  const contract = useContract({
    addressOrName: contracts.lendingPool,
    contractInterface: lendingPoolABI.abi,
    signerOrProvider: data,
  });
  const dai = useContract({
      addressOrName: contracts.dai,
      contractInterface: erc20ABI,
      signerOrProvider: data,
  });

  useEffect(() => {
    if (!loan.maturity) {
      // Go to borrow and force user to connect.
      // Once we have a session, shouldn't need this trick.
      Router.push("/");
      return;
    }
  }, [loan]);

  const onSubmit: SubmitHandler<ConsentForm> = async () => {
    const res = await contract.borrow(loan.amount, BigNumber.from(loan.maturity), BigNumber.from(loan.nftId));
    await res.wait();

    await getBalance
  };

  const getBalance = async () => {
      if (contract && data) {
          const bal = await contract.callStatic.balanceOf(await data?.getAddress());
          const dec = await contract.callStatic.decimals();
          setBalance({balance: bal, decimals: dec});
      }
  }

  return (
    <>
      <h1>Smart Contract Loan</h1>

      <div style={{ fontSize: "18px", maxWidth: "700px" }}>
        <ContractBullets loan={loan} />

        <p>Please type: "{SentenceToType}"</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            id="consent"
            type="text"
            className={`form-control my-3 ${
              errors.consent ? "is-invalid" : ""
            }`}
            {...register("consent", {
              required: true,
              validate: (value) => value === SentenceToType,
            })}
            placeholder="I consent..."
          />
          <ErrorDisplay error={errors.consent} inputName="Consent" />

          <div className="centerContent pt-0 mt-0">
            <button
              type="submit"
              className="btn btn-danger btn-lg mt-3 px-5 py-3"
            >
              Sign and Escrow ID NFT to draw loan
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Contract;
