import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.css";
import { AppProps } from "next/app";
import Head from "next/head";
import Image from "next/image";
import { FC, useState } from "react";
import { Provider } from "wagmi";
import { Navbar } from "../components/NavBar";
import ConnectorProviders from "../lib/connectorProviders";
import { InitContextValue, LoanContext, LoanInterface } from "../lib/context";
import "../styles/index.css";

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const [loan, setLoan] = useState<LoanInterface>(InitContextValue);

  return (
    <div className="bg-gradient-to-br from-pink-400 to-white-300">
      <LoanContext.Provider value={{ loan, setLoan }}>
        <Provider autoConnect connectors={ConnectorProviders}>
          <Navbar />
          <div className="pt-10 flex justify-center items-center v-screen">
            <Image src={"/ultraVioletLogo.gif"} width={200} height={50} />
            {/* <h1 style={{ fontSize: "70px" }}>UltraViolet</h1> */}
          </div>
          <div className="main">
            <Head>
              <title>Violet</title>
              <meta name="description" content="Web3 Violet Identity Portal" />
            </Head>
            <Component {...pageProps} />
          </div>
        </Provider>
      </LoanContext.Provider>
    </div>
  );
};

export default App;
