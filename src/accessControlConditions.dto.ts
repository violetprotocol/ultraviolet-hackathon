export class AccessControlConditionsDto {
  contractAddress: string;
  standardContractType: string;
  chain: string;
  method: string;
  parameters: string[];
  returnValueTestComparator: string;
  returnValueTestValue: string;
}
