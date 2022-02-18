import type { NextPage } from "next";
import Router from "next/router";
import { useEffect, useContext } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

import ContractBullets from "../components/contractBullets";
import { ErrorDisplay } from "../components/formInput";
import { LoanContext } from "../lib/context";

const SentenceToType = "I consent to the terms outlined above";

interface ConsentForm {
  consent: string;
}

const Contract: NextPage = () => {
  const { loan } = useContext(LoanContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConsentForm>();

  useEffect(() => {
    if (!loan.maturity) {
      // Go to borrow and force user to connect.
      // Once we have a session, shouldn't need this trick.
      Router.push("/borrow");
      return;
    }
  }, [loan]);

  const onSubmit: SubmitHandler<ConsentForm> = () => {
    console.log("Front flow is done \\o/. Smart contract is pinged?");
  };

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
