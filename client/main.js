import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import '../imports/startup/accounts-config.js';

import App from '../imports/ui/App';
 
Meteor.startup(() => {
  Accounts.ui.config({
    requestPermissions:{
      google: ['https://www.googleapis.com/auth/calendar']
    }
  });
  // Meteor.absoluteUrl.defaultOptions.rootUrl = 'meteor-test-deploy.herokuapp.com';
  render(<App />, document.getElementById('render-target'));
});
