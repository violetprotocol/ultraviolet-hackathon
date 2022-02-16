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

  return (
    <>
      <h1>Borrow page</h1>

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

        <h3>3. Upload your passport.</h3>
        <p>
          <code>@TODO</code>
        </p>

        <button type="submit" className="btn btn-primary btn-lg">
          Submit
        </button>
      </form>
    </>
  );
};

export default Borrow;
