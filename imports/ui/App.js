import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import {Form, FormGroup, Input, Popover,  PopoverBody,  } from 'reactstrap';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { Meteor } from 'meteor/meteor';
import { Tasks } from '../api/tasks.js';
import { Lists } from '../api/lists.js';

import Task from './Task.js';
import List from './Lists.js';
import AccountsUIWrapper from './AccountsUIWrapper.js';
 
  class App extends Component {
    constructor(props) {
      super(props);
   
      this.state = {
        hideChecked: false,
        sendToCalendar: false,
        todoText: '',
        listId: '',
        listName: '',
        popover: false,
      };

      this.toggleHideCompleted = this.toggleHideCompleted.bind(this);
      this.toggleSendTocalendar = this.toggleSendTocalendar.bind(this);
      this.toglePopover = this.toglePopover.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleChangeList = this.handleChangeList.bind(this);
      this.handleSubmitList = this.handleSubmitList.bind(this);
      this.handleListName = this.handleListName.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
      if (!prevProps.currentUser && this.props.currentUser) {
        this.setState({ hideChecked: this.props.currentUser && this.props.currentUser.profile && this.props.currentUser.profile.hideChecked });
        // this.setState({ selectedList: this.this.props.currentUser && this.props.currentUser.profile &&  this.props.currentUser.profile.selectedListId});
      }
    }

    handleSubmit(event) {
      event.preventDefault();
      Meteor.call('tasks.insert', { text: this.state.todoText, sendToCalendar: this.state.sendToCalendar, listId: this.props.currentUser ? this.props.currentUser.selectedListId : '' }, 
        (error) => {
          if (error && error.error ) {
            this.toglePopover();
             console.log('ERRR,', error);
          }
      });
      this.setState({todoText:''});
    }

    handleSubmitList(event){
      event.preventDefault();
      Meteor.call('lists.create', { listName: this.state.listName });
      this.setState({ listName:'' });
    }

    handleListName() {
        if (this.props.lists) {
          let list = this.props.lists.find( l => l._id === this.props.currentUser.selectedListId);
          return (list && list.name);
      }
    }

    toglePopover(){
      this.setState({ popover: !this.state.popover });
    }

    handleChange(event) {
      this.setState({ todoText: event.target.value });
    }

    handleChangeList(event) {
      this.setState({ listName: event.target.value });
    }

    toggleHideCompleted() {
      Meteor.call('tasks.hideChecked', { isCheked:!this.state.hideChecked });
      this.setState({ hideChecked: !this.state.hideChecked });
    }

    toggleSendTocalendar() {
      this.setState({
        sendToCalendar: !this.state.sendToCalendar,
      });
    }
    renderLists() {
      return this.props.lists.map((list) => {
        return (
          <List
            list={list}
            key={list._id}
            isSelect={this.state.selectedList}
          />
        );
      });
    }

    renderTasks() {
      let filteredTasks = this.props.tasks;

      if (this.state.hideChecked) {
        filteredTasks = filteredTasks.filter(task => !task.checked);
      }

      return filteredTasks.map((task) => {
        const currentUserId = this.props.currentUser && this.props.currentUser._id;
        const showPrivateButton = task.ownerId === currentUserId;
        
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
      // console.log('render',this.props.currentUser ? this.props.currentUser.selectedListId : '');

    return (
    <ReactCSSTransitionGroup
      transitionName="example"
      transitionEnterTimeout={5000}
      transitionLeaveTimeout={5000}
      transitionAppear={true}
      transitionAppearTimeout={5000}
    >
      <div className="container">

        <div className="tasks-container">
          <header>
            <h1>Todo List ({this.props.incompleteCount})</h1>
            <label className="hide-completed">

                <Input
                  type="checkbox"
                  readOnly
                  checked={this.state.hideChecked}
                  onClick={this.toggleHideCompleted}
                />
                Hide Completed Tasks

            </label>

            <label className="hide-completed">
              <Form>
                <Input
                  type="checkbox"
                  className = "send-to-calendar"
                  readOnly
                  checked={this.state.sendToCalendar}
                  onClick={this.toggleSendTocalendar}
                />
                Add to calendar
              </Form>
            </label>
          <AccountsUIWrapper />
          
          {this.props.currentUser
            ? <Form 
                className="new-task" 
                onSubmit={this.handleSubmit} 
              >
                <FormGroup>
                  <Input
                    id="taskText"
                    type="text"
                    ref="textInput"
                    placeholder="Type to add new tasks"
                    value={this.state.todoText}
                    onChange={this.handleChange}
                  />
                  <Popover placement="bottom" isOpen={this.state.popover} target="taskText" toggle={this.toglePopover}>
                    <PopoverBody>
                      You should select task-list before insert a new task{' '}
                    </PopoverBody>
                  </Popover>
                </FormGroup>
              </Form> 
            : ''  
          }
          </header>
          <ul>
            {this.renderTasks()}
          </ul> 
        </div>
        {this.props.currentUser 
        ? <div className="lists-container">
            <h1 className = "list-head"> Current list:{' '}
            { this.handleListName() }
            </h1>
            { this.props.currentUser ?
              <Form 
                className="new-list" 
                onSubmit={this.handleSubmitList} 
              >
                <FormGroup>
                  <Input
                    type="text"
                    ref="textInput"
                    placeholder="Type to add new list"
                    value={this.state.listName}
                    onChange={this.handleChangeList}
                  />
                </FormGroup>
              </Form> : '' }

            <ul>
              { this.renderLists() }
            </ul>

          </div> : ''}
        </div>
      </ReactCSSTransitionGroup>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe('tasks');
  Meteor.subscribe('lists');
  Meteor.subscribe('user');

  return {
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
    lists: Lists.find({}, { sort: { createdAt: -1 } }).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user(),
  };
})(App);
