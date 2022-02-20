import { BigNumber } from "ethers";
import type { NextPage } from "next";
import Router from "next/router";
import { useContext, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { erc20ABI, useContract, useSigner } from "wagmi";
import ContractBullets from "../components/contractBullets";
import { ErrorDisplay } from "../components/formInput";
import contracts from "../constants/contracts";
import lendingPoolABI from "../constants/lendingpool.json";
import { BalanceContext, LoanContext } from "../lib/context";

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
  const [{ data }] = useSigner();
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
    const res = await contract.borrow(
      loan.amount,
      BigNumber.from(loan.maturity),
      BigNumber.from(loan.nftId),
    );
    await res.wait();

    await getBalance();

    Router.push("/loans");
  };

  const getBalance = async () => {
    if (dai && data) {
      const bal = await dai.balanceOf(await data?.getAddress());
      const dec = await dai.decimals();
      setBalance({ balance: bal, decimals: dec });
    }
  };

  return (
    <>
      <h1 style={{ fontSize: "30px" }}>
        <i className="neon-green">Binding Contract Wording</i>
      </h1>

      <br />
      <br />
      <div style={{ fontSize: "18px", maxWidth: "700px" }}>
        <ContractBullets loan={loan} />

        <br />
        <br />
        <p className="title font-teletactile" style={{ fontSize: "13px" }}>
          Please type: "{SentenceToType}"
        </p>

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
              className="glowing-button-blue uppercase my-8"
            >
              Sign contract
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Contract;
