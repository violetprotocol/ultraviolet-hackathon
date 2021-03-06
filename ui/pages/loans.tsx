import { utils } from "ethers";
import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import { useContract, useSigner } from "wagmi";
import CardTable from "../components/Cards/CardTable";
import Modal from "../components/Modal";
import contracts from "../constants/contracts";
import IERC20Abi from "../constants/erc20.json";
import lendingPoolABI from "../constants/lendingpool.json";
import { normalizeLoan } from "../lib/normalizeLoan";
import { NormalizedLoan } from "../lib/types";

const Loans: NextPage = () => {
  const [{ data: signer }] = useSigner();
  const [currentLoans, setCurrentLoans] = useState<NormalizedLoan[]>([]);
  const [isRepaySectionShown, setIsRepaySectionShown] = useState(false);
  const [lendingPoolAllowance, setLendingPoolAllowance] = useState(null);
  const [isTxPending, setIsTxPending] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const lendingPoolContract = useContract({
    addressOrName: contracts.lendingPool,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    contractInterface: lendingPoolABI.abi,
    signerOrProvider: signer,
  });

  const daiContract = useContract({
    addressOrName: contracts.dai,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    contractInterface: IERC20Abi,
    signerOrProvider: signer,
  });

  const getAllowance = useCallback(async () => {
    const allowance = await daiContract.allowance(
      await signer.getAddress(),
      contracts.lendingPool,
    );
    const formattedAllowance = utils.formatUnits(allowance, 18);
    setLendingPoolAllowance(formattedAllowance);
  }, [daiContract, signer]);

  const getLoans = useCallback(async () => {
    if (!signer) {
      console.log("signer is not defined");
      return;
    }
    setIsFetching(true);
    const connectedAddress = await signer.getAddress();
    console.log("connectedAddress", connectedAddress);
    const loan = await lendingPoolContract.loans(connectedAddress);
    console.log("loan", loan);
    if (!loan) {
      console.log("loan is not defined. loan:", loan);
      return;
    }
    const defaulted = await lendingPoolContract.hasDefaulted(connectedAddress);

    const normalizedLoan = normalizeLoan(connectedAddress, loan, defaulted);

    let loans;
    if (normalizedLoan == null) {
      loans = [];
    } else {
      loans = [normalizedLoan];
    }

    setIsFetching(false);
    setCurrentLoans(loans);
  }, [signer, lendingPoolContract]);

  useEffect(() => {
    if (!signer) {
      return;
    }

    getAllowance();
  }, [daiContract, signer]);

  useEffect(() => {
    getLoans();
  }, [lendingPoolContract, signer]);

  const onShowRepayClick = () => {
    setIsRepaySectionShown(true);
  };

  const handleRepaySubmit = async (amount) => {
    console.log(`Processing repayment of ${amount}`);
    const parsedAmount = utils.parseUnits(amount, 18);
    let res;
    try {
      res = await lendingPoolContract.repay(parsedAmount);
    } catch (error) {
      console.error(error);
      return;
    }
    setIsTxPending(true);
    await res.wait();
    setIsTxPending(false);
    await getLoans();
  };

  const handleApproveSubmit = async (amount) => {
    const parsedAmount = utils.parseUnits(amount, 18);
    let res;
    try {
      res = await daiContract.approve(contracts.lendingPool, parsedAmount);
    } catch (error) {
      console.error(error);
    }
    await res.wait();

    await getAllowance();
  };
  return (
    <>
      <h1 style={{ fontSize: "40px" }} className="mb-4">
        <i className="neon-green">Your Loans</i>
      </h1>

      <div style={{ maxWidth: "80%" }} className="backlight">
        <CardTable
          isFetching={isFetching}
          loans={currentLoans}
          onButtonClick={onShowRepayClick}
          isTxPending={isTxPending}
          buttonText={{ pending: "Pending", default: "Repay" }}
        />
        {isRepaySectionShown && (
          <Modal
            lendingPoolAllowance={lendingPoolAllowance}
            onCancel={() => setIsRepaySectionShown(false)}
            onRepay={(amount) => {
              setIsRepaySectionShown(false);
              handleRepaySubmit(amount);
            }}
            onApprove={handleApproveSubmit}
          />
        )}
      </div>
    </>
  );
};

export default Loans;
