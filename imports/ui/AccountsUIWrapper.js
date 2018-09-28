import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
 
export default class AccountsUIWrapper extends Component {
  componentDidMount() {
    // Use Meteor Blaze to render login buttons
    this.view = Blaze.render(Template.loginButtons,
      ReactDOM.findDOMNode(this.refs.container));
      
/*      Meteor.loginWithGoogle({
        requestPermissions: ['email']
      }, function(error) {
        if (error) {
          console.log(error); //If there is any error, will get error here
        }else{
          console.log(Meteor.user());// If there is successful login, you will get login details here
          }
      });
*/
  }
  componentWillUnmount() {
    // Clean up Blaze view
    Blaze.remove(this.view);
  }
  render() {
    // Just render a placeholder container that will be filled in
    return <span ref="container" />;
  }
}