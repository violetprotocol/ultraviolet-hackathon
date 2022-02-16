import type { NextPage } from "next";
import Router from "next/router";
import { useEffect, useContext } from "react";

import { LoanContext } from "../lib/context";

const Confirm: NextPage = () => {
  const { loan } = useContext(LoanContext);
  useEffect(() => {
    if (!loan.maturity) {
      // Go to borrow and force user to connect.
      // Once we have a session, shouldn't need this trick.
      Router.push("/borrow");
    }
  }, [loan]);

  return (
    <>
      <h1>Confirm your loan parameters</h1>
      <p>Loan: {JSON.stringify(loan)}</p>
    </>
  );
};

export default Confirm;
