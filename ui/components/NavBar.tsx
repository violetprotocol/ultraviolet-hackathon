import Router from "next/router";
import Link from 'next/link';

export const Navbar = () => {
    const onClick = () => {
        Router.push("/loans");
    }

    return (
        <nav style={{width: '100%'}} className='flex'>
            <button onClick={onClick}>
                Open Loans
            </button>
        </nav>
    );
  }