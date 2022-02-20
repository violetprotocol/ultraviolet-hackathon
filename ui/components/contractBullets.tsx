import { computeDue } from "../lib/computeDue";

const Point = ({ name, body }) => {
  return (
    <li>
      <span style={{ fontSize: "20px", paddingRight: "10px" }}>
        <i className="neon-red">{name}</i>
      </span>: {body}
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
          <span className="title font-teletactile" style={{width:"100%", fontSize: "13px"}}>
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

      <br/>
      <Point
        name="Loan"
        body={
          <span className="title font-teletactile" style={{width:"100%", fontSize: "13px"}}>
            Party A lends <ColorText text={`${loan.amount} DAI`} /> to Party B.
          </span>
        }
      />

      <br/>
      <Point
        name="Interest"
        body={
          <span className="title font-teletactile" style={{width:"100%", fontSize: "13px"}}>
            Party B shall pay <ColorText text="10% APY" /> in interest.
          </span>
        }
      />

      <br/>
      <Point
        name="Payment"
        body={
          <span className="title font-teletactile" style={{width:"100%", fontSize: "13px"}}>
            Party B shall pay{" "}
            <ColorText text={`${computeDue(loan).toFixed(3)} DAI`} /> to Party A
            before the loan ends on <ColorText text={new Date(loan.maturity).toLocaleString()} />.
          </span>
        }
      />

      <br/>
      <Point
        name="Payment Instruction"
        body={
          <span className="title font-teletactile" style={{width:"100%", fontSize: "13px"}}>
            Payment must be made to <ColorText text={loan.lenderAddr} />.
          </span>
        }
      />

      <br/>
      <Point
        name="Prepayment"
        body={
          <span className="title font-teletactile" style={{width:"100%", fontSize: "13px"}}>
            Party B shall be entitled to repay the loan in full at any time
          </span>
        }
      />

      <br/>
      <Point
        name="Identification"
        body={
          <span className="title font-teletactile" style={{width:"100%", fontSize: "13px"}}>
            Party B shall deposit his/her <ColorText text="Passport" /> in
            Identity Escrow. In case of default, Party A will be given access to
            the <ColorText text="Passport" />.
          </span>
        }
      />

      <br/>
      <Point
        name="Identification"
        body={
          <span className="title font-teletactile" style={{width:"100%", fontSize: "13px"}}>
            The Parties agree to follow UltraViolet's{" "}
            <a href="https://violet.co">Privacy Policy</a>.
            <br/>
            <br/>
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
