import type { NextPage } from "next";
import { useContext } from "react";

import { LoanContext } from "../lib/context";

const Contract: NextPage = () => {
  const { loan } = useContext(LoanContext);
  return (
    <>
      <h1>Contract</h1>
      <p>{JSON.stringify(loan)}</p>
    </>
  );
};

export default Contract;
