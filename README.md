<p align="center">
  <a href="https://twitter.com/violetprotocol" target="blank"><img src="https://pbs.twimg.com/profile_images/1426133232932859906/XJfCacup_400x400.jpg" width="320" alt="Violet Logo" /></a>
</p>


# HACKATON ULTRAVIOLET

## Description


UltraViolet Loans enable Apes without crypto riches (aka "WAGMI Apes") to get secure, personal loans from their Rich Ape friends, without having to provide any collateral.

Loan Setup & Identity Escrow This becomes possible, because a WAGMI Ape borrower verifies his identity first, then signs a legally binding contract and finally puts his identity data into an encrypted, NFT-gated data vault. The NFT gating the vault is held in escrow by the smart contract issuing the loan. UltraViolet calls this new DeFi primitive “Identity Escrow.”

Repayment In case the WAGMI Ape repays his loan successfully, the smart contract sends the NFT back to him. In case the WAGMI Ape does not repay the loan (on time), the NFT is transferred to the lender (or lending pool manager), who is now gaining access to the WAGMI Ape’s identity. It is up to the lender to pursue possible legal recourse against the borrower, since he broke the contract.

Take-Away Introducing an Identity Escrow and pairing it with a smart loan contract plus a legally binding signature enables new primitives such as uncollateralized yet pseudonymous personal loans that bridge the divide between Web3 and the real world. UltraViolet Loans will be especially beneficial for WAGMI Apes, who are new to crypto and cannot afford collateralization.

## Installing and running

On the root directory

``` yarn install ```

Then to run the backend:

Cd into the /contracts/ directory and do

```yarn compile```

Then come back to the root directory and do

``` yarn start```

To run the fronend:
``` yarn dev:ui  ```


## Running the app

| Component name         | Local URL from docker |
|------------------------|-----------------------|
| Front end              | localhost:3000        |
| BackEnd                | localhost:3002        |

The database is running on the cloud

### The database only serves as a backup for ipfs content that might not have replicated
on multiple nodes yet:

The IPFS timeout is currently set at 20 seconds
In case the timeout is reached, then we read the encrypted file from the database for demo purposes

## Stay in touch

- Gabriel Ferraz - [twitter](https://twitter.com/sudoferraz)
- Chris Chung - [twitter](https://twitter.com/RaphaelRoullet)
- Raphael Roulette - [twitter](https://twitter.com0xpApaSmURf)

## License

Nest is [MIT licensed](LICENSE).
