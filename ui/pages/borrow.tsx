import type { NextPage } from "next";
import { useForm, SubmitHandler } from "react-hook-form";

import FormData from "../interfaces/formData";
import FormInput from "../components/formInput";

const Borrow: NextPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = (data) => {
    // @TODO: this should:
    // 1. Send a post to the back
    // 2. Route to the contract page
    console.log("the data we submit:", data);
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
          type="date"
          placeholder=""
        />

        <h3>3. Upload your passport.</h3>
        <p>
          <code>@TODO</code>
        </p>

        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </>
  );
};

export default Borrow;
