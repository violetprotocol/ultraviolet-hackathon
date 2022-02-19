import Router from "next/router";
import Link from 'next/link';
import { useContract, useSigner } from "wagmi";
import contracts from "../constants/contracts";
import { erc20ABI } from "wagmi";
import { useContext, useEffect, useState } from "react";
import { BalanceContext } from "../lib/context";
import { BigNumber } from "ethers";

export const Navbar = () => {
    const { balance, setBalance } = useContext(BalanceContext);
    const [{ data, error, loading }, getSigner] = useSigner();
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
            setBalance({balance: bal, decimals: dec});
        }
    }

    return (
        <nav style={{width: '100%'}} className='flex'>
            <p>
                DAI Balance: {(balance.balance.div(BigNumber.from(10).pow(balance.decimals))).toNumber().toFixed(2)}
            </p>
        </nav>
    );
  }