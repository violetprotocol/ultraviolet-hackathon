import { computeDue } from "../lib/computeDue";

const Point = ({ name, body }) => {
  return (
    <li>
      <span
        style={{
          fontSize: "20px",
          paddingRight: "10px",
          fontFamily: "ui-monospace",
        }}
      >
        <i className="text-black">{name}</i>
      </span>
      : {body}
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
    <ol className="bg-white rounded p-4">
      <Point
        name="Parties"
        body={
          <span
            className="title text-black"
            style={{
              width: "100%",
              fontSize: "13px",
              fontFamily: "SFMono-Regular",
            }}
          >
            The personal loan agreement made <Today /> between{" "}
            <ColorText text={loan.lenderAddr} /> ("Party A") and{" "}
            <ColorText text={loan.borrowerAddr} /> ("Party B").
            <p className="mt-2">
              HEREINAFTER, the Borrower and Lender ("Parties") agree to the
              following:
            </p>
          </span>
        }
      />

      <Point
        name="Loan"
        body={
          <span
            className="title text-back"
            style={{
              width: "100%",
              color: "black",
              fontSize: "13px",
              fontFamily: "SFMono-Regular",
            }}
          >
            Party A lends <ColorText text={`${loan.amount} DAI`} /> to Party B.
          </span>
        }
      />

      <Point
        name="Interest"
        body={
          <span
            className="title text-black"
            style={{
              width: "100%",
              fontSize: "13px",
              fontFamily: "ui-monospace",
            }}
          >
            Party B shall pay <ColorText text="10% APY" /> in interest.
          </span>
        }
      />

      <br />
      <Point
        name="Payment"
        body={
          <span
            className="title text-black"
            style={{
              width: "100%",
              fontSize: "13px",
              fontFamily: "SFMono-Regular",
            }}
          >
            Party B shall pay{" "}
            <ColorText text={`${computeDue(loan).toFixed(3)} DAI`} /> to Party A
            before the loan ends on{" "}
            <ColorText text={new Date(loan.maturity).toLocaleString()} />.
          </span>
        }
      />

      <Point
        name="Payment Instruction"
        body={
          <span
            className="title text-black"
            style={{
              width: "100%",
              fontSize: "13px",
              fontFamily: "SFMono-Regular",
            }}
          >
            Payment must be made to <ColorText text={loan.lenderAddr} />.
          </span>
        }
      />

      <Point
        name="Prepayment"
        body={
          <span
            className="title text-black"
            style={{
              width: "100%",
              fontSize: "13px",
              fontFamily: "SFMono-Regular",
            }}
          >
            Party B shall be entitled to repay the loan in full at any time
          </span>
        }
      />

      <Point
        name="Identification"
        body={
          <span
            className="title text-black"
            style={{
              width: "100%",
              fontSize: "13px",
              fontFamily: "SFMono-Regular",
            }}
          >
            Party B shall deposit his/her <ColorText text="Passport" /> in
            Identity Escrow. In case of default, Party A will be given access to
            the <ColorText text="Passport" />.
          </span>
        }
      />

      <Point
        name="Identification"
        body={
          <span
            className="title text-black"
            style={{
              width: "100%",
              fontSize: "13px",
              fontFamily: "SFMono-Regular",
            }}
          >
            The Parties agree to follow UltraViolet's{" "}
            <a href="https://violet.co">Privacy Policy</a>.
            <br />
            <br />
            <p>
              IN WITNESS WHEREOF, the Parties have executes this Agreement as of
              the undersigned dates written below
            </p>
          </span>
        }
      />
    </ol>
  );
};

export default ContractBullets;
