import { BigNumber, utils } from "ethers";
import type { NextPage } from "next";
import Router from "next/router";
import { useEffect, useState } from "react";
import { useContract, useSigner } from "wagmi";
import CardTable from "../components/Cards/CardTable";
import DoxxModal from "../components/DoxxModal";
import contracts from "../constants/contracts";
import lendingPoolABI from "../constants/lendingpool.json";
import { normalizeLoan } from "../lib/normalizeLoan";
import { NormalizedLoan } from "../lib/types";
import nftABI from "../constants/nftABI.json";

const LenderLoans: NextPage = () => {
  const [{ data: signer, error, loading }, getSigner] = useSigner();
  const lendingPool = useContract({
    addressOrName: contracts.lendingPool,
    contractInterface: lendingPoolABI.abi,
    signerOrProvider: signer,
  });
  const uvnft = useContract({
    addressOrName: contracts.nft,
    contractInterface: nftABI.abi,
    signerOrProvider: signer,
  });

  const [loans, setLoans] = useState<NormalizedLoan[]>([]);
  const [isTxPending, setIsTxPending] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isDoxxed, setIsDoxxed] = useState(false);

  useEffect(() => {
    getLoans();
  }, [lendingPool, signer]);

  const getLoans = async () => {
    if (!signer) {
      return;
    }
    setIsFetching(true);

    const connectedAddress = await signer.getAddress();
    const owner = await lendingPool.owner();

    if (connectedAddress != owner) {
      Router.push("/dashboard");
    }

    const borrowers = await lendingPool.getBorrowers();

    const loansPromises = borrowers.map(async (borrower) => {
      const loan = await lendingPool.loans(borrower);
      const defaulted = await lendingPool.hasDefaulted(connectedAddress);
      const normalizedLoan = normalizeLoan(borrower, loan, defaulted);
      return normalizedLoan;
    })

    const fetchedLoans = await Promise.all(loansPromises);
    console.log(fetchedLoans);

    setIsFetching(false);
    setLoans(fetchedLoans);
  };

  const onDoxx = async (user: string, func: (boolean)=>void, param: boolean) => {
    // check if the nft has already been sent to lender
    const loan = await lendingPool.loans(user);
    const nftId = loan.tokenId;

    console.log(nftId);
    const nftOwner = await uvnft.ownerOf(nftId);
    if (signer && nftOwner != await signer.getAddress()) {
      setIsTxPending(true);
      const res = await lendingPool.unlockIdentityEscrow(user);
      await res.wait();
      setIsTxPending(false);
    }

    func(param);
  }

  return (
    <>
    <h1 className="mb-4">Open Loans</h1>
      <div style={{ maxWidth: "80%" }}>
        <CardTable 
          title={"Current Loans"}
          isFetching={isFetching}
          loans={loans}
          onButtonClick={onDoxx}
          isTxPending={isTxPending}
          buttonText={{pending: "Pending...", default: "Doxx ☠️"}}
          isLender={true}/>
      </div>
    </>
  );
};

export default LenderLoans;
