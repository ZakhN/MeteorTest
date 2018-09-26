import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import classnames from 'classnames';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

export default class Task extends Component {

  toggleChecked() {
    // Set the checked property to the opposite of its current value
    Meteor.call('tasks.setChecked', this.props.task._id, !this.props.task.checked);
  }
  deleteThisTask() {
    Meteor.call('tasks.remove', this.props.task._id);
  }
  togglePrivate() {
    Meteor.call('tasks.setPrivate', this.props.task._id, ! this.props.task.private);
  }

  render() {

   // text.test(timeReg) && (!text.test(reg)) && console.log('objectobjectobjectobjectobject');
   // const text = this.props.task.text.replace(this.props.task.dueDate,'');
   // const todayReg = /сегодня/;
   // const tomorrowReg = /завтра/;
   // const regExp = /(сегодня|завтра) && (\s([1-9]|1[0-2]):[0-9]{2}\s(AM|PM))/gim;

   const taskClassName = classnames({
     checked: this.props.task.checked,
     private: this.props.task.private,
    });
    
    const reg = /(сегодня|завтра)/;
    const timeReg = /(?:[1-9]|1[0-2]):[0-9]{2}\s(?:AM|PM)/;

    const text = this.props.task.text.replace(reg,'');
    const textNew = text.replace(timeReg,'');

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
            <strong>{this.props.task.username}</strong>: {textNew} <strong>{ (this.props.task.dueDate.length > 1) ? 'dueDate:' : '' }</strong> { this.props.task.dueDate  }
          </span>
  
        </li>
      </ReactCSSTransitionGroup>
    );
  }
}