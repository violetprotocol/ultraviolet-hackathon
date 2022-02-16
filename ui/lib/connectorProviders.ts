import { defaultChains } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

const chains = defaultChains;

const ConnectorProvider = () => {
  return [new InjectedConnector({ chains })];
};

export default ConnectorProvider;
