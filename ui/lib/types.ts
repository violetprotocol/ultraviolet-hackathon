export interface AccessControlConditions {
    contractAddress: string,
    standardContractType: string,
    chain: number,
    method: string,
    parameters: Array<string>,
    returnValueTest: {
        comparator: string,
        value: string
    }
}