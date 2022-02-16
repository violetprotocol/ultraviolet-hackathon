import { computeDue } from "../lib/computeDue";

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

const ContractBullets = ({ loan }) => {
  return (
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
            Party A lends <ColorText text={`${loan.amount} DAI`} /> to Party B.
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
            <ColorText text={`${computeDue(loan).toFixed(3)} DAI`} /> to Party A
            before the loan ends on {new Date(loan.maturity).toLocaleString()}.
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
            Identity Escrow. In case of default, Party A will be given access to
            the <ColorText text="Passport" />.
          </>
        }
      />

      <Point
        name="Identification"
        body={
          <>
            The Parties agree to follow UltraViolet's{" "}
            <a href="https://violet.co">Privacy Policy</a>.
            <p>
              IN WITNESS WHEREOF, the Parties have executes this Agreement as of
              the undersigned dates written below
            </p>
          </>
        }
      />
    </ol>
  );
};

export default ContractBullets;
