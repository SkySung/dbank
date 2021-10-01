import { Tabs, Tab } from 'react-bootstrap'
import dBank from '../abis/dBank.json'
import React, { Component } from 'react';
import Token from '../abis/Token.json'
import dbank from '../dbank.png';
import Web3 from 'web3';
import './App.css';


class App extends Component {

  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    if(typeof window.ethereum !== 'undefined') {

      await window.ethereum.enable();
      const web3 = new Web3(window.ethereum);
      const netId = await web3.eth.net.getId();
      const accounts = await web3.eth.getAccounts();
      console.log(accounts);
      //可能要先requireAccounts，或者手動連結Metamask
      if(typeof accounts !== 'undefined') {
        const balance = await web3.eth.getBalance(accounts[0]);
        this.setState({ account: accounts[0], balance: balance, web3: web3})
      } else {
        window.alert('Please login with Metamask')
      }

      try {
        const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address);
        const dbank = new web3.eth.Contract(dBank.abi, dBank.networks[netId].address);
        //檢查abi中的netId是否相符
        const dBankAddress = dBank.networks[netId].address
        this.setState({token: token, dbank: dbank, dBankAddress: dBankAddress});
      } catch(e) {
        console.log('Error', e)
        window.alert('Contracts not deployed to the current network')
        
      }
    } else {
      window.alert('Please install Metamask')
    }
  }

  async deposit(amount) {
    console.log(amount)
    if(this.state.dbank!=='undefined') {
      try{
        //記得send
        await this.state.dbank.methods.deposit().send({value: amount.toString(), from: this.state.account})
      } catch(e) {
        console.log('Error, deposit: ', e)
      }
    }
  }

  async withdraw(e) {
    //prevent button from default click
    e.preventDefault()
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.dbank.methods.withdraw().send({from: this.state.account});
      } catch(e) {
        console.log('Error, withdraw: ', e)
      }
    }
  }

  async nowDeposit(e) {
    e.preventDefault()
    const _nowDeposit = await this.state.dbank.methods.nowDeposit().call()
    console.log(_nowDeposit);
  }
  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      dbank: null,
      balance: 0,
      dBankAddress: null,
    }
  }

  render() {
    return (
      <div className='text-monospace'>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
        <img src={dbank} className="App-logo" alt="logo" height="32"/>
          <b>dBank</b>
        </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
        <br></br>
          <h1>歡迎來到韭菜銀行！</h1>
          <h2>{this.state.account}</h2>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
              <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                <Tab eventKey="deposit" title="Deposit">
                  <div>
                  <br></br>
                    你想要存多少錢？
                    <br></br>
                    (min. amount: 0.01 ETH)
                    <br></br>
                    (一次只能存一筆錢)
                    <br></br>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      let amount = this.depositAmount.value
                      amount = amount * 10**18 //convert to wei
                      this.deposit(amount)
                    }}>
                      <div className='form-group mr-sm-2'>
                      <br></br>
                        <input
                          id='depositAmount'
                          step="0.01"
                          type='number'
                          ref={(input) => { this.depositAmount = input }}
                          className="form-control form-control-md"
                          placeholder='amount...'
                          required />
                      </div>
                      <button type='submit' className='btn btn-primary'>DEPOSIT</button>
                    </form>

                  </div>
                </Tab>
                <Tab eventKey="withdraw" title="Withdraw">
                  <br></br>
                    你要取錢嗎？利息以Good Leek Coin發放。
                    <br></br>
                    <br></br>
                  <div>
                    <button type='submit' className='btn btn-primary' onClick={(e) => this.withdraw(e)}>WITHDRAW</button>
                  </div>
                </Tab>
              </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;