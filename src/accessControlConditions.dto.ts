export class AccessControlConditionsDto {
  contractAddress: string;
  standardContractType: string;
  chain: number;
  method: string;
  parameters: string[];
  returnValueTestComparator: string;
  returnValueTestValue: string;
}
