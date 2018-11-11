import React, {Component} from 'react';
import {CardElement, injectStripe} from 'react-stripe-elements';

class CheckoutForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      imageurl: '',
      imageurl1: '',
    };

    this.submit = this.submit.bind(this);
  }

  async submit() {
    let { token } = await this.props.stripe.createToken();

    const uploader = new Slingshot.Upload("myFileUploads");
        
    let inputFile = document.getElementById('avatar').files;

      inputFile[0] && inputFile[0] && await new Promise((resolve, reject) => {
        uploader.send(inputFile[0], (error, downloadUrl) => {
          if (error) {
            console.error('Error uploading', /* uploader.xhr.response */ error);
            alert (error);
            reject(error);
          } else {
            this.state.imageurl = downloadUrl; 
          } 
          resolve();
        });
      });

      inputFile[1] && inputFile[1] && await new Promise((resolve, reject) => {
        uploader.send(inputFile[1], (error, downloadUrl) => {
          if (error) {
            console.error('Error uploading', /* uploader.xhr.response */ error);
            alert (error);
            reject(err);
          } else {
            this.state.imageurl1 = downloadUrl;
          } 
          resolve();
        });
        });
        // console.log(this.props.filesUpload);
    const methodParams = {
      token: token,
      reason: this.props.reason,
      items: {
        sendToCalendar: this.props.sendToCalendar,
        filesUpload: this.props.filesUpload === 1 ? 1 : this.props.filesUpload === 2 ? 2 : false,
      }
    };
    // console.log(methodParams);

    await Meteor.call('stripe.charge', methodParams, (err) => {
      if (err) throw Meteor.Error('error');

      if (this.props.reason ==='taskBuy' && !this.props.listId) throw new Meteor.Error('there is not list Id');

      if (methodParams.reason === 'taskBuy'){
        const insertParams = {
          text: this.props.todoText,
          listId: this.props.listId,
          imageurl: this.state.imageurl,
          imageurl1: this.state.imageurl1,
        };

        if (this.props.sendToCalendar) insertParams.sendToCalendar = this.props.sendToCalendar;
        if (this.props.imageurl) insertParams.imageurl = this.props.imageurl;
        if (this.props.imageurl1) insertParams.imageurl = this.props.imageurl1;

        Meteor.call('tasks.insert', insertParams);
        this.props.close();
      }

      if (methodParams.reason === 'listBuy') {
        Meteor.call('lists.create', {
          listName: this.props.listName,
        });
        this.props.close();
      }
    });
  }

   render() {
    let counter = 0;

    if (this.props.reason === 'listBuy') counter += 100;

    if (this.props.reason === 'taskBuy'){
      counter += 1;
      if (this.props.sendToCalendar) counter += 0.5;
      if (this.props.filesUpload === 1) counter += 0.75;
      if (this.props.filesUpload > 1) counter += 1.5;
    }

    return (
      <div className="checkout">
        <h1>Price: {counter.toString()+'$'}</h1>
        <p>addition options: {this.props.sendToCalendar && 'send to calendar'}{this.props.filesUpload ? 'uploadind files': ''}</p>
        <p>Would you like to complete the purchase?</p>
        <CardElement />
        <button onClick={this.submit}>Send</button>
      </div>
    );
  }
}

export default injectStripe(CheckoutForm);
