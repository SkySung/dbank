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
          <h1>Decentralized Bank</h1>
          <h2>{this.state.account}</h2>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
              <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                <Tab eventKey="deposit" title="Deposit">
                  <div>
                    <br></br>
                    How much do you want to deposit?
                    <br></br>
                    (min. amount is 0.01ETH)
                    <br></br>
                    (one deposit is possibe at the time)
                    <br></br>
                    <form onSubmit={(e) => {
                      //先避免畫面重載
                      e.preventDefault()
                      let amount = this.depositAmount.value
                      amount = Web3.utils.toWei(amount)
                      this.deposit(amount)
                    }}>
                      <div className='form-group mr-sm-2'>
                        <br></br>
                        <input
                          id='depositAmount'
                          step="0.01"
                          type='number'
                          className="form-control form-control-md"
                          placeholder='amount...'
                          required
                          ref={(input) => {this.depositAmount = input}}
                        />
                        </div><button type='submit' className='btn btn-primary'>Deposit</button>
                    </form>
                  </div>
                  </Tab>
                <Tab eventKey="withdraw" title="Withdraw">
                <div>
                  <br></br>
                  How much do you want to withdraw?
                </div>
                <div>
                  <button type='submit' className='btn btn-primary' onClick={(e) => this.withdraw(e)}>Withdraw</button>
                </div>
                </Tab> 
                <Tab eventKey="account" title="balance">
                  <br></br>
                  Metamask balance
                  <br></br>
                  {Web3.utils.fromWei(this.state.balance.toString())}
                  <br></br>
                  Dbank balance
                  <br></br>
                  <button type='submit' className='btn btn-primary' onClick={(e) => this.nowDeposit(e)}>Check</button>
                  <br></br>
                  {this.nowDeposit()}
                  <br></br>                </Tab>
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