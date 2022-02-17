import type { NextPage } from "next";
import Router from "next/router";
import { useEffect, useContext, useState } from "react";
import { useConnect, useAccount, useSignMessage } from "wagmi";
import Image from "next/image";
import { SiweMessage } from "siwe";

import { LoanContext } from "../lib/context";

const Home: NextPage = () => {
  const [{ data, error }, connect] = useConnect();
  const [{ data: accountData }] = useAccount();
  const [siweNonce, setSiweNonce] = useState<string>();
  const [siweMessage, setSiweMessage] = useState<SiweMessage>();
  const [{ data: signature, error: errorSigning, loading }, signMessage] =
    useSignMessage();
  const { loan, setLoan } = useContext(LoanContext);

  useEffect(() => {
    if (accountData?.address) {
      fetch("http://localhost:8080/nonce", {
        headers: { "Content-Type": "application/json" },
        credentials: "include" as RequestCredentials,
      }).then(async (data) => {

        const receivedNonce = await data.text();
        setSiweNonce(receivedNonce);

        const message = new SiweMessage({
          domain: document.location.host,
          address: accountData.address,
          chainId: await accountData.connector.getChainId(),
          uri: document.location.origin,
          version: "1",
          statement: "UltraViolet Login",
          nonce: receivedNonce,
        });

        setSiweMessage(message);
        const preparedMessage = message.prepareMessage();
        await signMessage({ message: preparedMessage });
      });
      loan.borrowerAddr = accountData.address;
      setLoan(loan);
    }
  }, [accountData?.address]);

  useEffect(() => {
    if (signature && siweMessage) {
      fetch("http://localhost:8080/api/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include" as RequestCredentials,
        body: JSON.stringify({
          signature: signature,
          siweMessage: siweMessage,
        }),
      }).then((response) => {
        console.log(response.text());
        Router.push("/borrow");
      });
      // Should router only after siwe message
      Router.push("/borrow");
    }
  }, [signature]);

  // if (siweMessage) {
  //   return (
  //     <div>
  //       <p> test</p>
  //     </div>
  //   );
  // }

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
