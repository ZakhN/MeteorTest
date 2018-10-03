import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import { Tasks } from '../api/tasks.js';
import Task from './Task.js';

import AccountsUIWrapper from './AccountsUIWrapper.js';
 
// App component - represents the whole app
  class App extends Component {
    constructor(props) {
      super(props);
   
      this.state = {
        hideCompleted: false,
        sendToCalendar: false,
      };
      
      this.handleSubmit = this.handleSubmit.bind(this);
      this.toggleHideCompleted = this.toggleHideCompleted.bind(this);
      this.toggleSendTocalendar = this.toggleSendTocalendar.bind(this);
    }

    handleSubmit(event) {
      event.preventDefault();
      // Find the text field via the React ref
      const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
      // const sendToCalendar = 
      Meteor.call('tasks.insert', text, this.state.sendToCalendar);
      // Clear form(error)=>{
      //   if (error && error.error === "There is no date") {
      //     Session.set("errorMessage", "Please insert the day.");
      //   }
      // }
      ReactDOM.findDOMNode(this.refs.textInput).value = '';
    }

    toggleHideCompleted() {
      this.setState({
        hideCompleted: !this.state.hideCompleted,
      });
    }

    toggleSendTocalendar() {
      this.setState({
        sendToCalendar: !this.state.sendToCalendar,
      });
    }

  renderTasks() {
    let filteredTasks = this.props.tasks;

    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }

    return filteredTasks.map((task) => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = task.owner === currentUserId;
 
      return (
        <Task
          key={task._id}
          task={task}
          showPrivateButton={showPrivateButton}
        />
      );
    });
  }
 
  render() {
    return (
      <div className="container">
        <header>
        <h1>Todo List ({this.props.incompleteCount})</h1>
          <label className="hide-completed">
            <input
              type="checkbox"
              readOnly
              checked={this.state.hideCompleted }
              onClick={this.toggleHideCompleted}
            />
            Hide Completed Tasks
          </label>
          <label className="send-to-calendar">
            <input
              type="checkbox"
              readOnly
              checked={this.state.sendToCalendar}
              onClick={this.toggleSendTocalendar}
            />
            Add to calendar
          </label>
        <AccountsUIWrapper />
        
        { this.props.currentUser 
          ? <form 
            className="new-task" 
            onSubmit={this.handleSubmit} 
            >
            <input
              type="text"
              ref="textInput"
              placeholder="Type to add new tasks"
            />
          </form> 
          : ''
        }
        </header>
        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe('tasks');
  return {
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user(),
  };
})(App);
