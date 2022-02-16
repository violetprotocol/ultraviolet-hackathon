import type { NextPage } from "next";
import Router from "next/router";
import { useState, useEffect, useContext } from "react";

import { LoanContext } from "../lib/context";
import { isValidDate, computeDue } from "../lib/computeDue";

const importantTxt = "text-danger font-weight-bold";

const Confirm: NextPage = () => {
  const { loan } = useContext(LoanContext);
  const [due, setDue] = useState<string>("not set");
  useEffect(() => {
    if (!loan.maturity) {
      // Go to borrow and force user to connect.
      // Once we have a session, shouldn't need this trick.
      Router.push("/borrow");
      return;
    }

    const dueNumber: number = computeDue(loan);
    setDue(dueNumber.toFixed(3));
  }, [loan]);

  if (!isValidDate(loan)) {
    return <p>Invalid loan maturity</p>;
  }

  return (
    <>
      <h1 className="mb-4">Confirm your loan parameters</h1>
      <div style={{ fontSize: "20px" }}>
        <p>
          You will borrow <span className={importantTxt}>{loan.amount}</span>{" "}
          until the{" "}
          <span className={importantTxt}>
            {new Date(loan.maturity).toLocaleString()}
          </span>
          .
        </p>

        <p>
          At this date, you will owe <span className={importantTxt}>{due}</span>
          .
        </p>
      </div>
      <button
        className="btn btn-danger btn-lg"
        onClick={() => Router.push("/contract")}
      >
        Confirm
      </button>
    </>
  );
};

export default Confirm;
