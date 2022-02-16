import { FC, useState } from "react";
import { AppProps } from "next/app";
import { Provider } from "wagmi";
import Head from "next/head";
import Image from "next/image";

import "../styles/index.css";
import "bootstrap/dist/css/bootstrap.css";

import { LoanInterface, LoanContext, InitContextValue } from "../lib/context";
import ConnectorProviders from "../lib/connectorProviders";

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const [loan, setLoan] = useState<LoanInterface>(InitContextValue);

  return (
    <div className="bg-gradient-to-br from-purple-300 to-white-300">
      <div className="pt-10 flex justify-center items-center v-screen">
        <Image src={"/ultraVioletLogo.gif"} width={200} height={50} />
      </div>
      <div className="main">
        <Head>
          <title>Violet</title>
          <meta name="description" content="Web3 Violet Identity Portal" />
        </Head>
        <LoanContext.Provider value={{ loan, setLoan }}>
          <Provider autoConnect connectors={ConnectorProviders}>
            <Component {...pageProps} />
          </Provider>
        </LoanContext.Provider>
      </div>
    </div>
  );
};

export default App;
