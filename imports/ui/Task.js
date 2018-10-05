import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import classnames from 'classnames';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

export default class Task extends Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: this.props.task.checked,
    };
    
    this.toggleChecked = this.toggleChecked.bind(this);
    this.togglePrivate = this.togglePrivate.bind(this);
    this.deleteThisTask = this.deleteThisTask.bind(this);
  }
  
  toggleChecked() {
    Meteor.call('tasks.setChecked', { taskId: this.props.task._id, setChecked: !this.props.task.checked });
  }

  deleteThisTask() {
    Meteor.call('tasks.remove',  { taskId:this.props.task._id });
  }

  togglePrivate() {
    Meteor.call('tasks.setPrivate', { taskId: this.props.task._id,  setToPrivate: !this.props.task.private });
  }

  render() {
   const taskClassName = classnames({
     checked: this.props.task.checked,
     private: this.props.task.private,
  });

    const reg = /((^| )сегодня(\W|$)|(^| )завтра(\W|$))/ig;
    const timeReg = /(?:[1-9]|1[0-2]):[0-9]{2}\s(?:AM|PM)/ig;

    const text = this.props.task.text.replace(timeReg,' ');
    const textNew = text.replace(reg,' ');

    return (
      
      <ReactCSSTransitionGroup
        transitionName="example"
        transitionEnterTimeout={5000}
        transitionLeaveTimeout={5000}
        transitionAppear={true}
        transitionAppearTimeout={5000}
      >
      
        <li className={taskClassName} >
          <button 
            className="delete" 
            onClick={this.deleteThisTask}
          >
            &times;
          </button>
         <input
            type="checkbox"
            readOnly
            checked={this.state.checked}
            onClick={this.toggleChecked}
          />
          
          { this.props.showPrivateButton ? (
            <button className="toggle-private" onClick={this.togglePrivate.bind(this)}>
              { this.props.task.private ? 'Private' : 'Public' }
            </button>
          ) : ''}

            <span className="text">
              <strong>{this.props.task.username}</strong>
              {textNew}
              <strong>{(this.props.task.dueDate) ? 'dueDate:' : ''}</strong>
                {this.props.task.dueDate
                  ? moment.utc(this.props.task.dueDate).format('LLL')
                  : '' 
                }
            </span>
          
        </li>
      </ReactCSSTransitionGroup>
    );
  }
}