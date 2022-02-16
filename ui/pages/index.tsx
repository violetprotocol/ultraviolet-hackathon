import type { NextPage } from "next";
import Router from "next/router";
import { useEffect, useContext } from "react";
import { useConnect, useAccount } from "wagmi";
import Image from "next/image";

import { LoanContext } from "../lib/context";

const Home: NextPage = () => {
  const [{ data, error }, connect] = useConnect();
  const [{ data: accountData }] = useAccount();
  const { loan, setLoan } = useContext(LoanContext);

  useEffect(() => {
    if (accountData?.address) {
      //fetch("http://localhost:3001/nonce").then(async (data) => {
      //  console.log(await data.text());
      //});
      loan.borrowerAddr = accountData.address;
      setLoan(loan);
      Router.push("/borrow");
    }
  }, [accountData?.address]);

  return (
    <div className="bg-white p-10 rounded-lg shadow-md">
      <h1 className="title">Personal Loans w/o Collateral</h1>
      <div className="centerContent">
        <Image
          className="-webkit-user-select: none;margin: auto;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"
          src={"/dai.png"}
          width={50}
          height={50}
        />
      </div>
      <h1 className="title">Borrow Dai for 10% APY</h1>
      <div className="px-6 py-4 border-t border-purple-200">
        <div className="border rounded-lg p-4 bg-gradient-to-r from-pink-300 to-purple-400">
          Fully anonymous if paid back in full.
        </div>
      </div>
      <div className="centerContent">
        {data.connectors.map((connector) => (
          <button key={connector.id}>
            <Image
              className="-webkit-user-select: none;margin: auto;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"
              onClick={() => connect(connector)}
              src={
                "https://raw.githubusercontent.com/spruceid/siwe/main/assets/SIWE_Button_Dark_BG.png"
              }
              width={200}
              height={50}
            />
          </button>
        ))}
      </div>
      {error && <div>{error?.message ?? "Failed to connect"}</div>}
    </div>
  );
};

export default Home;
