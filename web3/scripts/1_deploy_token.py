from brownie import accounts, config, TokenERC20

initialSupply = 100000000000000000000
tokenName = "TOKEN"
tokenSymbol = "TKN"

def main():
    account = accounts[0]
    erc20 = TokenERC20.deploy(initialSupply, tokenName, tokenSymbol, {"from": account})
