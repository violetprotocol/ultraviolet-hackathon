export interface AccessControlConditions {
  contractAddress: string;
  standardContractType: string;
  chain: string;
  method: string;
  parameters: Array<string>;
  returnValueTest: {
    comparator: string;
    value: string;
  };
}
