import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.css";
import { AppProps } from "next/app";
import Head from "next/head";
import { FC, useState } from "react";
import { Provider } from "wagmi";
import { Navbar } from "../components/NavBar";
import ConnectorProviders from "../lib/connectorProviders";
import {
  BalanceContext,
  BalanceInterface,
  InitBalanceContextValue,
  InitContextValue,
  LoanContext,
  LoanInterface,
} from "../lib/context";
import "../styles/glowing-button.css";
import "../styles/index.css";
import "../styles/neon.css";
import "nes.css/css/nes.min.css";

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const [loan, setLoan] = useState<LoanInterface>(InitContextValue);
  const [balance, setBalance] = useState<BalanceInterface>(
    InitBalanceContextValue,
  );

  return (
    <div
      className="text-sky-50 bg-gradient-to-br from-black to-violet-900"
      style={{ minHeight: "100vh" }}
    >
      <BalanceContext.Provider value={{ balance, setBalance }}>
        <LoanContext.Provider value={{ loan, setLoan }}>
          <Provider connectors={ConnectorProviders}>
            <Navbar />
            <div className="pt-10 flex justify-center items-center v-screen">
              <h1 style={{ fontSize: "70px" }}>
                <i className="neon-blue">ULTRA</i>
                <i>🤝</i>
                <i className="neon-violet">VIOLET</i>
              </h1>
            </div>
            <div className="main">
              <Head>
                <title>Violet</title>
                <meta
                  name="description"
                  content="Web3 Violet Identity Portal"
                />
                <link
                  rel="stylesheet"
                  href="./node_modules/nes.css/css/nes.min.css"
                />
              </Head>
              <Component {...pageProps} />
            </div>
          </Provider>
        </LoanContext.Provider>
      </BalanceContext.Provider>
    </div>
  );
};

export default App;
