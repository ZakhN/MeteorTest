import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import classnames from 'classnames';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

export default class Task extends Component {

  toggleChecked() {

    Meteor.call('tasks.setChecked', this.props.task._id, !this.props.task.checked);
  }
  deleteThisTask() {
    Meteor.call('tasks.remove', this.props.task._id);
  }
  togglePrivate() {
    Meteor.call('tasks.setPrivate', this.props.task._id, ! this.props.task.private);
  }

  render() {

   const taskClassName = classnames({
     checked: this.props.task.checked,
     private: this.props.task.private,
    });

    const reg = /((^| )сегодня(\W|$)|(^| )завтра(\W|$))/ig;
    const timeReg = /(?:[1-9]|1[0-2]):[0-9]{2}\s(?:AM|PM)/ig;

    const text = this.props.task.text.replace(timeReg,'');
    const textNew = text.replace(reg,'');

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
            onClick={this.deleteThisTask.bind(this)}
          >
            &times;
          </button>
        
       
         <input
            type="checkbox"
            readOnly
            checked={!!this.props.task.checked}
            onClick={this.toggleChecked.bind(this)}
          />
          <span className="text">
            <strong>{this.props.task.username}</strong> {textNew} <strong>{ (this.props.task.dueDate) ? 'dueDate:' : '' }</strong> { (this.props.task.dueDate) ? moment(this.props.task.dueDate).format('LLLL') : '' }
          </span>
  
        </li>
      </ReactCSSTransitionGroup>
    );
  }
}