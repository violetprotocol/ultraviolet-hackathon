import { FC } from "react";
import { AppProps } from "next/app";
import { Provider } from "wagmi";
import "bootstrap/dist/css/bootstrap.css";

import { ConnectorProviders } from "../services/connectorProviders";

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <div className="container pt-5">
      <Provider autoconnect connectors={ConnectorProviders}>
        <Component {...pageProps} />
      </Provider>
    </div>
  );
};

export default App;
