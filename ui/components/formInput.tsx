import { FC } from "react";

interface InputProps {
  register;
  error;

  type: string;
  inputName: string;
  placeholder;
}

export const ErrorDisplay = ({ error, inputName }) => {
  if (error && error.type === "required") {
    return <div className="invalid-feedback">{inputName} is required</div>;
  }
  return null;
};

const FormInput: FC<InputProps> = ({
  register,
  error,
  type,
  inputName,
  placeholder,
}) => {
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

export default FormInput;
