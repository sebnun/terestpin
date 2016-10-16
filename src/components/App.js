import React, { Component } from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { firebaseApp } from '../firebase';
import * as firebase from 'firebase';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';
import Dashboard from './Dashboard'

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      loggedIn: firebaseApp.auth().currentUser ? true : false,
      showRecent: true
    }

    this.handleShowMyPins = this.handleShowMyPins.bind(this);
    this.handleShowRecent = this.handleShowRecent.bind(this);
  }

  componentWillMount() {
    firebaseApp.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ loggedIn: true, showRecent: false });
      } else {
        this.setState({ loggedIn: false, showRecent: true });
      }
    }).bind(this);
  }


  handleShowRecent() {
    this.setState({ showRecent: true });
  }

  handleShowMyPins() {
    this.setState({ showRecent: false });
  }

  handleLogin() {
    const provider = new firebase.auth.TwitterAuthProvider();
    firebaseApp.auth().signInWithPopup(provider).then((result) => {
      console.log('twitter login');
    }).catch((error) => {
      console.log(error);
    });
  }

  handleLogout() {
    firebaseApp.auth().signOut().then(() => {
      console.log('sign out');
    }, (error) => {
      console.log(error);
    });
  }

  render() {

    return (
      <MuiThemeProvider>
        <div className="container-fluid">

          <div className="row">
            <Toolbar>
              
              { this.state.loggedIn ? 
              <ToolbarGroup>
                <ToolbarTitle text="TerestPin" />
                <RaisedButton label="My Pins" primary={true} onTouchTap={this.handleShowMyPins} />
                <RaisedButton label="Recent Pins" primary={true} onTouchTap={this.handleShowRecent} />    
              </ToolbarGroup>
              :
              <ToolbarGroup>
                <ToolbarTitle text="TerestPin" />
              </ToolbarGroup>
              }

              <ToolbarGroup>
                {this.state.loggedIn ? 
                  <RaisedButton label="Logout" onTouchTap={this.handleLogout} /> 
                  :
                  <RaisedButton label="Login with Twitter" onTouchTap={this.handleLogin} /> 
                }
              </ToolbarGroup>

            </Toolbar>
          </div>

          <div className="row">
              <Dashboard recent={this.state.showRecent} />
          </div>

        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
