import type { NextPage } from "next";
import { useAccount } from "wagmi";

const Borrow: NextPage = () => {
  const [{ data: accountData }] = useAccount();

  return (
    <>
      <h1>Borrow page</h1>
      <p>Account Address: {JSON.stringify(accountData?.address)}</p>
    </>
  );
};

export default Borrow;
