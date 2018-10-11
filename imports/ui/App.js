import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import {Form, FormGroup, Input, Popover,  PopoverBody,  } from 'reactstrap';

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
        modal: false,
      };

      this.toggleHideCompleted = this.toggleHideCompleted.bind(this);
      this.toggleSendTocalendar = this.toggleSendTocalendar.bind(this);
      this.toggleModal = this.toggleModal.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleChangeList = this.handleChangeList.bind(this);
      this.handleSubmitList = this.handleSubmitList.bind(this);
    }

    componentDidUpdate(prevProps) {
      if (!prevProps.currentUser && this.props.currentUser) {
        this.setState({ hideChecked: this.props.currentUser && this.props.currentUser.profile && this.props.currentUser.profile.hideChecked });
        // this.setState({ selectedList: this.this.props.currentUser && this.props.currentUser.profile &&  this.props.currentUser.profile.selectedListId});
      }
    }

    handleSubmit(event) {
      event.preventDefault();
      Meteor.call('tasks.insert', { text: this.state.todoText, sendToCalendar: this.state.sendToCalendar, listId: this.props.currentUser.profile.selectedListId }, 
        (error) => {
          if (error){
            this.toggleModal();
             console.log('ERRR,', error.error);
          }
      });
      this.setState({todoText:''});
    }

    handleSubmitList(event){
      event.preventDefault();
      Meteor.call('lists.create', {listName: this.state.listName});
      this.setState({listName:''});
    }

    toggleModal(){
      this.setState({modal: !this.state.modal});
    }

    handleChange(event) {
      this.setState({todoText: event.target.value});
    }

    handleChangeList(event) {
      this.setState({listName: event.target.value});
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

        <div className="tasks-container">
          <header>
            <h1>Todo List ({this.props.incompleteCount})</h1>
            <label className="hide-completed">
            <Form>
              <Input
                type="checkbox"
                value={this.state.hideChecked}
                readOnly
                checked={this.state.hideChecked}
                onClick={this.toggleHideCompleted}
              />
              Hide Completed Tasks
            </Form>
            </label>
            <label className="send-to-calendar">
            </label>
              <Input
                type="checkbox"
                className = "send-to-calendar"
                value={this.state.sendToCalendar}
                readOnly
                checked={this.state.sendToCalendar}
                onClick={this.toggleSendTocalendar}
              />
              Add to calendar
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
                  <Popover placement="bottom" isOpen={this.state.modal} target="taskText" toggle={this.toggleModal}>
                    <PopoverBody>You should select task-list before insert a new task
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
            <h1 className = "list-head">Current list {this.props.lists.map(list => list._id === this.props.currentUser.profile.selectedlistId ? list.name  : '')}</h1>
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

            <ul className= ''>
              { this.renderLists() }
            </ul>

          </div> : ''}
        </div>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe('tasks');
  Meteor.subscribe('lists');
  return {
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
    lists: Lists.find({}, { sort: { createdAt: -1 } }).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user(),
  };
})(App);
