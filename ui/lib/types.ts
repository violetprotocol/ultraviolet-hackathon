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

export interface NormalizedLoan {
  maturity: number
  totalAmountDue: string,
  tokenId: number,
  defaulted: boolean
}
