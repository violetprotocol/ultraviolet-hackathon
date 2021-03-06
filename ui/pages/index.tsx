import LitJsSdk from "lit-js-sdk";
import type { NextPage } from "next";
import Image from "next/image";
import Router from "next/router";
import { useContext, useEffect, useState } from "react";
import { SiweMessage } from "siwe";
import {
  useAccount,
  useConnect,
  useContract,
  useSigner,
  useSignMessage,
} from "wagmi";
import contracts from "../constants/contracts";
import lendingPoolABI from "../constants/lendingpool.json";
import { LoanContext } from "../lib/context";

declare global {
  interface Window {
    litNodeClient?: any;
  }
}

const Home: NextPage = () => {
  const [{ data, error }, connect] = useConnect();
  const [{ data: accountData }] = useAccount();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_siweNonce, setSiweNonce] = useState<string>();
  const [siweMessage, setSiweMessage] = useState<SiweMessage>();
  const [{ data: signature }, signMessage] = useSignMessage();
  const { loan, setLoan } = useContext(LoanContext);
  const [{ data: signer }] = useSigner();
  const contract = useContract({
    addressOrName: contracts.lendingPool,
    contractInterface: lendingPoolABI.abi,
    signerOrProvider: signer,
  });

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

  const nextPage = async () => {
    if (signer) {
      const connectedAddress = await signer.getAddress();
      const owner = await contract.owner();
      console.log(owner);

      if (connectedAddress == owner) {
        Router.push("/lender");
      } else {
        Router.push("/dashboard");
      }
    }
  };

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
      }).then(async (response) => {
        console.log(response.text());
        const client = new LitJsSdk.LitNodeClient();
        await client.connect();
        window.litNodeClient = client;
        await nextPage();
      });
      // Should router only after siwe message
    }
  }, [signature]);

  return (
    <>
      <div className="container mx-auto px-4 h-full">
        <div className="flex content-center items-center justify-center h-full w-full">
          <div className="w-full lg:w-6/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 rounded-lg bg-blueGray-200 border-0">
              <div className="rounded-t mb-0 px-6 py-6">
                <div className="text-center mb-3">
                  <h2 className="title font-teletactile">
                    Personal Loans without any collateral
                  </h2>
                </div>
                <div className="centerContent">
                  <Image
                    className="-webkit-user-select: none;margin: auto;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"
                    src={"/dai.png"}
                    width={50}
                    height={50}
                  />
                </div>
                <h2 className="title font-teletactile">
                  Borrow Dai for 10% APY
                </h2>
                <hr className="mt-6 border-b-1 border-blueGray-300" />
              </div>
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <div className="text-white text-center mb-3 font-bold">
                  <div className="border rounded-lg p-4 bg-gradient-to-r from-pink-300 to-purple-400">
                    Fully pseudonymous if paid back in full
                  </div>
                </div>
                <div className="centerContent">
                  {data.connectors.map((connector) => (
                    <button className="nes-pointer" key={connector.id}>
                      <Image
                        className="nes-pointer -webkit-user-select: none;margin: auto;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;"
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
            </div>
            <div className="flex flex-wrap mt-6 relative">
              <div className="w-1/2">
                <a
                  href="#pablo"
                  onClick={(e) => e.preventDefault()}
                  className="text-blueGray-200"
                ></a>
              </div>
              <div className="w-1/2 text-right"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
