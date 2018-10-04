import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import { Tasks } from '../api/tasks.js';
import Task from './Task.js';

import AccountsUIWrapper from './AccountsUIWrapper.js';
 
  class App extends Component {
    constructor(props) {
      super(props);
   
      this.state = {
        hideChecked: false,
        sendToCalendar: false,
        todoText: ''
      };

      this.handleSubmit = this.handleSubmit.bind(this);
      this.toggleHideCompleted = this.toggleHideCompleted.bind(this);
      this.toggleSendTocalendar = this.toggleSendTocalendar.bind(this);
      this.handleChange = this.handleChange.bind(this);
    }

    componentDidUpdate(prevProps) {
      if (!prevProps.currentUser && this.props.currentUser) {
        this.setState({ hideChecked: this.props.currentUser && this.props.currentUser.profile && this.props.currentUser.profile.hideChecked });
      }
    }

    handleSubmit(event) {
      event.preventDefault();
      // const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
      Meteor.call('tasks.insert', this.state.todoText, this.state.sendToCalendar);
      this.setState({todoText:''});
    }

    handleChange(event) {
      this.setState({todoText: event.target.value});
    }

    toggleHideCompleted() {
      Meteor.call('tasks.hideChecked', !this.state.hideChecked);
      this.setState({ hideChecked: !this.state.hideChecked });
    }

    toggleSendTocalendar() {
      this.setState({
        sendToCalendar: !this.state.sendToCalendar,
      });
    }

  renderTasks() {
    let filteredTasks = this.props.tasks;

    if (this.state.hideChecked) {
      
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
              checked={this.state.hideChecked }
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
              value={this.state.todoText}
              onChange={this.handleChange}
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
