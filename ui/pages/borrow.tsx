import { BigNumber } from "ethers";
import type { NextPage } from "next";
import Router from "next/router";
import { useContext, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import FormInput from "../components/formInput";
import { LoanContext } from "../lib/context";
import FormData from "../lib/formData";

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
    loan.amount = BigNumber.from(data.amount).mul(BigNumber.from("10").pow(18));
    console.log(Date.parse(data.maturity) / 1000);
    loan.maturity = Date.parse(data.maturity) / 1000;
    setLoan(loan);
    Router.push("/contract");
  };

  return (
    <>
      <h1 style={{ fontSize: "30px" }}>
        <i className="neon-green">Set your borrowing terms</i>
      </h1>
      <br />
      <br />
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        <h2
          className="title font-teletactile text-left"
          style={{ fontSize: "13px" }}
        >
          1. How much do you want to borrow?
        </h2>
        <FormInput
          register={register}
          error={errors.amount}
          inputName="amount"
          type="number"
          placeholder={0}
        />

        <br />
        <h2
          className="title font-teletactile text-left"
          style={{ fontSize: "13px" }}
        >
          2. Select the maturity of your loan.
        </h2>
        <FormInput
          register={register}
          error={errors.maturity}
          inputName="maturity"
          type="datetime-local"
          placeholder=""
        />

        <div className="centerContent pt-0 mt-0">
          <button type="submit" className="glowing-button-pink uppercase my-8">
            Confirm
          </button>
        </div>
      </form>
    </>
  );
};

export default Borrow;
