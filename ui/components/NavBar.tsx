import Router from "next/router";
import Link from 'next/link';
import { useContract, useSigner } from "wagmi";
import contracts from "../constants/contracts";
import { erc20ABI } from "wagmi";
import { useEffect, useState } from "react";

export const Navbar = () => {
    const [{ data, error, loading }, getSigner] = useSigner();
    const [balance, setBalance] = useState<string>();
    const contract = useContract({
        addressOrName: contracts.dai,
        contractInterface: erc20ABI,
        signerOrProvider: data,
    });

    const onClick = () => {
        Router.push("/loans");
    }
    
    useEffect(() => {
        getBalance();
    }, [contract])

    const getBalance = async () => {
        if (contract && data) {
            const bal = await contract.callStatic.balanceOf(await data?.getAddress());
            const dec = await contract.callStatic.decimals();
            const decBal = bal / (10**dec);
            setBalance(decBal.toFixed(2));
        }
    }

    return (
        <nav style={{width: '100%'}} className='flex'>
            <p>
                DAI Balance: {balance}
            </p>
        </nav>
    );
  }