import type { NextPage } from "next";
import Router from "next/router";
import { useEffect, useContext } from "react";

import { LoanContext } from "../lib/context";
import { computeDue } from "../lib/computeDue";

const SentenceToType = "I consent to the terms outlined above";

const Point = ({ name, body }) => {
  return (
    <li>
      <span style={{ fontWeight: 600 }}>{name}:</span> {body}
    </li>
  );
};

const Today = () => {
  return <span className="text-danger">{new Date().toLocaleDateString()}</span>;
};

const ColorText = ({ text }) => {
  return <span className="text-danger">{text}</span>;
};

const Contract: NextPage = () => {
  const { loan } = useContext(LoanContext);

  useEffect(() => {
    if (!loan.maturity) {
      // Go to borrow and force user to connect.
      // Once we have a session, shouldn't need this trick.
      Router.push("/borrow");
      return;
    }
  }, [loan]);

  return (
    <>
      <h1>Smart Contract Loan</h1>

      <div style={{ fontSize: "18px", maxWidth: "700px" }}>
        <ol>
          <Point
            name="Parties"
            body={
              <>
                The personal loan agreement made <Today /> between{" "}
                <ColorText text={loan.lenderAddr} /> ("Party A") and{" "}
                <ColorText text={loan.borrowerAddr} /> ("Party B").
                <p className="mt-2">
                  HEREINAFTER, the Borrower and Lender ("Parties") agree to the
                  following:
                </p>
              </>
            }
          />

          <Point
            name="Loan"
            body={
              <>
                Party A lends <ColorText text={`${loan.amount} DAI`} /> to Party
                B.
              </>
            }
          />

          <Point
            name="Interest"
            body={
              <>
                Party B shall pay <ColorText text="10% APY" /> in interest.
              </>
            }
          />

          <Point
            name="Payment"
            body={
              <>
                Party B shall pay{" "}
                <ColorText text={`${computeDue(loan).toFixed(3)} DAI`} /> to
                Party A before the loan ends on {loan.maturity.toLocaleString()}
                .
              </>
            }
          />

          <Point
            name="Payment Instruction"
            body={
              <>
                Payment must be made to <ColorText text={loan.lenderAddr} />.
              </>
            }
          />

          <Point
            name="Prepayment"
            body="Party B shall be entitled to repay the loan in full at any time"
          />

          <Point
            name="Identification"
            body={
              <>
                Party B shall deposit his/her <ColorText text="Passport" /> in
                Identity Escrow. In case of default, Party A will be given
                access to the <ColorText text="Passport" />.
              </>
            }
          />

          <Point
            name="Identification"
            body={
              <>
                The Parties agree to follow UltraViolet's{" "}
                <a href="https://violet.co">Privacy Policy</a>.
              </>
            }
          />
        </ol>

        <p>
          IN WITNESS WHEREOF, the Parties have executes this Agreement as of the
          undersigned dates written below
        </p>

        <p>Please type: "{SentenceToType}"</p>
      </div>
    </>
  );
};

export default Contract;
