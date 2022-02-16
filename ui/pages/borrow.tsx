import type { NextPage } from "next";
import { FC } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

interface FormData {
  amount: number;
  maturity: string;
}

interface InputProps {
  register;
  error;

  type: string;
  inputName: string;
  placeholder;
}

const Input: FC<InputProps> = ({
  register,
  error,
  type,
  inputName,
  placeholder,
}) => {
  const ErrorDisplay = ({ error, inputName }) => {
    if (error && error.type === "required") {
      return <div className="invalid-feedback">{inputName} is required</div>;
    }
    return null;
  };

  return (
    <div className="form-group my-4" style={{ maxWidth: "300px" }}>
      <input
        id={inputName}
        type={type ? type : "text"}
        className={`form-control ${error ? "is-invalid" : ""}`}
        {...register(inputName, { required: true })}
        placeholder={placeholder}
      />
      <ErrorDisplay error={error} inputName={inputName} />
    </div>
  );
};

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
        <Input
          register={register}
          error={errors.amount}
          inputName="amount"
          type="number"
          placeholder={0}
        />

        <h3>2. Select the maturity of your loan.</h3>
        <Input
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
