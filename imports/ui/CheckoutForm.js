import React, {Component} from 'react';
import {CardElement, injectStripe} from 'react-stripe-elements';

class CheckoutForm extends Component {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
  }

  async submit() {
    let { token } = await this.props.stripe.createToken();
    
    if (this.props.sendToCalendar) methodParams.sendToCalendar = this.props.sendToCalendar;

    const methodParams = {
      token: token, 
      reason: this.props.reason, 
      uploadFiles: this.props.uploadFiles && this.props.uploadFiles === 1 ? 1 : 2,
    };

    await Meteor.call('stripe.charge', methodParams);
  }
  
  render() {
    return (
      <div className="checkout">
        <p>Would you like to complete the purchase?</p>
        <CardElement />
        <button onClick={this.submit}>Send</button>
        <button onClick={() => this.props.closeModal() }>CLoSe</button>
      </div>
    );
  }
}

export default injectStripe(CheckoutForm);
