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
    loan.amount = parseInt(data.amount);
    loan.maturity = Date.parse(data.maturity);
    setLoan(loan);
    Router.push("/confirm");
  };

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
