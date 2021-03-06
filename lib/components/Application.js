import React, { Component } from 'react'
import firebase, { reference, signIn, signOut } from '../firebase';
import { pick, map, extend } from 'lodash';
import style from '../css/index.scss';

import LoginLogout from './LoginLogout';
import DisplayUsers from './DisplayUsers';
import InputSection from './InputSection';
import filterMessages from '../filterMessages';
import DisplayConversation from './DisplayConversation';

export default class Application extends Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      user: null,
      allUsers: null,
      allEmails: null,
      userMessages: null,
      reverse: false,
      userInput: null,
      filterMessages: [],
    }
  this.updateState = this.updateState.bind(this);
  this.sortUsers = this.sortUsers.bind(this);
  this.allMessages = this.allMessages.bind(this);
  }

  componentWillMount(){
    this.setState({userMessages: null});
  }

  componentDidMount(){
    firebase.database().ref('messages').on('value', (snapshot) => {
      if(snapshot.val()){
      let data = this.createArray(snapshot.val())
      this.setState({ messages: data })
      this.checkUser();
      }
    });
  }

  searchBar(e) {
    const userInput = e.target.value
    const filterConvo = this.state.messages.filter((message) => {
      return message.title.toLowerCase().includes(userInput.toLowerCase());
    });
    this.setState({ filterMessages: filterConvo });
  }

  createArray(value) {
    let keys = Object.keys(value)
    let messages = keys.map((singleMessage) => {
      return value[singleMessage]
    })
    return messages
  }

  updateState(message){
    let tempMessage = {title: message, id: Date.now(), user: this.state.user.displayName, email: '(' + this.state.user.email + ')'};
    firebase.database().ref('messages').push(tempMessage);
  }

  checkUser(){
    let array = this.state.messages.map((message)=> {
      let user = [message.user, message.email].join(' ')
      return user
    });
    var uniqueName = array.filter((elem, index, self)=> {
    return index == self.indexOf(elem);
    })
    this.setState({allUsers: uniqueName});
  }

  sortUsers(user){
    const selectedUser = filterMessages(user, this.state.messages);
    this.setState({userMessages: selectedUser});
  }

  chooseMessages() {
    if(this.state.filterMessages.length > 0){
      return this.state.filterMessages
    } else {
      return this.state.messages
    }
  }

  allMessages() {
    this.setState({userMessages: null});
  }

  render() {
    let button;
    let inputSection;
    let userNameSection;
    if(this.state.user === null){
      button = (<LoginLogout className="login" signInOut={signIn} setUser= {(userName) => this.setState({ user: userName.user })} text="login"/>);
      inputSection = (<p className="pls-login">Please log in to enter message</p>);
    }
    else{
      button = (<LoginLogout className="logout" signInOut={signOut} setUser= {(userName) => this.setState({ user: null })} text='logout'/>);
      inputSection = (<InputSection updateState={this.updateState}/>);
      userNameSection = (<p className="current-user">You are signed in as {this.state.user.displayName}</p>);


    }
    return (
      <section className="application">
        <div className="header">
          <h1 className="shoot-the-breeze">Shoot the Breeze</h1>
          <input className="search-input"  onChange={(e) => this.searchBar(e)} placeholder="Filter Messages"></input>
          <div className="rapper">
          {button}
          <button className="reverse-btn" onClick={()=>{this.setState({reverse: true})}}>sort ↑↓</button>
          </div>
        </div>
        {/* <button onClick={()=>{this.setState({reverse: false})}}>chron</button> */}
        <DisplayConversation messages={this.chooseMessages()} userMessages={this.state.userMessages} reverse={this.state.reverse} />
        <DisplayUsers users={this.state.allUsers} emails={this.state.allEmails} sortUsers={this.sortUsers} allMessages={this.allMessages} />
        {userNameSection}
        {inputSection}
      </section>
    )
  }
}
