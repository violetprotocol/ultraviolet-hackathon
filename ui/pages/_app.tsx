import { FC, useState } from "react";
import { AppProps } from "next/app";
import { Provider } from "wagmi";
import "bootstrap/dist/css/bootstrap.css";

import { LoanInterface, LoanContext, InitContextValue } from "../lib/context";
import ConnectorProviders from "../lib/connectorProviders";

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const [loan, setLoan] = useState<LoanInterface>(InitContextValue);

  return (
    <div className="container pt-5">
      <LoanContext.Provider value={{ loan, setLoan }}>
        <Provider autoConnect connectors={ConnectorProviders}>
          <Component {...pageProps} />
        </Provider>
      </LoanContext.Provider>
    </div>
  );
};

export default App;
