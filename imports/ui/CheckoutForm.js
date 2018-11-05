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

    console.log(this.props);

    const methodParams = {
      token: token, 
      reason: this.props.reason
    };
    
    if (this.props.filesUpload === 1) methodParams.filesUpload = 1;

    if (this.props.filesUpload > 1) methodParams.filesUpload = 2;

    console.log('methodParams', methodParams);

    await Meteor.call('stripe.charge', methodParams);
  }
  
  render() {
    return (
      <div className="checkout">
        <p>Would you like to complete the purchase?</p>
        <CardElement />
        <button onClick={this.submit}>Send</button>
      </div>
    );
  }
}

export default injectStripe(CheckoutForm);
