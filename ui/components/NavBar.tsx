import { BigNumber } from "ethers";
import { useContext, useEffect } from "react";
import { erc20ABI, useContract, useSigner } from "wagmi";
import contracts from "../constants/contracts";
import { BalanceContext } from "../lib/context";

export const Navbar = () => {
  const { balance, setBalance } = useContext(BalanceContext);
  const [{ data, error, loading }, getSigner] = useSigner();
  const contract = useContract({
    addressOrName: contracts.dai,
    contractInterface: erc20ABI,
    signerOrProvider: data,
  });

  useEffect(() => {
    getBalance();
  }, [contract]);

  const getBalance = async () => {
    if (contract && data) {
      const bal = await contract.callStatic.balanceOf(await data?.getAddress());
      const dec = await contract.callStatic.decimals();
      setBalance({ balance: bal, decimals: dec });
    }
  };

  return (
    <nav
      style={{ width: "100%" }}
      className="flex font-teletactile justify-end"
    >
      <p className="m-4 mr-4 text-sm">
        DAI Balance:{" "}
        {balance.balance
          .div(BigNumber.from(10).pow(balance.decimals))
          .toNumber()
          .toFixed(2)}
      </p>
    </nav>
  );
};
