import type { NextPage } from "next";
import { useEffect } from "react";
import { useContract, useNetwork, useSigner } from "wagmi";
import contracts from "../constants/contracts";
import lendingPoolABI from "../constants/lendingpool.json";

const Loans: NextPage = () => {
  const [
    { data: networkData, error: networkError, loading: networkLoading },
    switchNetwork,
  ] = useNetwork();
  const [{ data, error, loading }, getSigner] = useSigner();
  const contract = useContract({
    addressOrName: contracts.lendingPool,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    contractInterface: lendingPoolABI.abi,
    signerOrProvider: data,
  });

  useEffect(() => {}, [contract]);

  return (
    <>
      <h1 className="mb-4">Current Open Loans</h1>
    </>
  );
};

export default Loans;
