import type { NextPage } from "next";
import Router from "next/router";
import { useEffect, useContext } from "react";
import { useConnect, useAccount } from "wagmi";

import { LoanContext } from "../lib/context";

const Home: NextPage = () => {
  const [{ data, error }, connect] = useConnect();
  const [{ data: accountData }] = useAccount();
  const { loan, setLoan } = useContext(LoanContext);

  useEffect(() => {
    if (accountData?.address) {
      loan.borrowerAddr = accountData.address;
      setLoan(loan);
      Router.push("/borrow");
    }
  }, [accountData?.address]);

  return (
    <>
      <h1 className="mb-5">Connect to UltraViolet borrow</h1>
      {data.connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect(connector)}
          className="btn btn-primary"
        >
          Connect with {connector.name}
          {!connector.ready && " (unsupported)"}
        </button>
      ))}

      {error && <div>{error?.message ?? "Failed to connect"}</div>}
    </>
  );
};

export default Home;
