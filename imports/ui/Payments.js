import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Button, Badge, ButtonGroup, Popover,  PopoverBody, Input, Form } from 'reactstrap';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

export default class Lists extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  onSubmit(){
    
  }

  render() {
    console.log(this.props);
    return (
      <ReactCSSTransitionGroup
        transitionName="example"
        transitionEnterTimeout={5000}
        transitionLeaveTimeout={5000}
        transitionAppear={true}
        transitionAppearTimeout={5000}
      >
      <Badge>reason:{' '}{ this.props.payment.reason }</Badge>
      <Badge>amount:{' '}{ this.props.payment.charge.amount }</Badge>
      { this.props.payment.additionalOptions && <Badge>additionalOptions:{' '}{ this.props.payment.additionalOptions.map(o => o) }</Badge> }
      <Badge>created at :{' '}{ moment.utc(this.props.payment.createdAt).format('LLL') }</Badge><br/><hr/>
      </ReactCSSTransitionGroup>
    );
  }
}

