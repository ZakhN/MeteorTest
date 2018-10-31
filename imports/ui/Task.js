import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import classnames from 'classnames';
import { withTracker } from 'meteor/react-meteor-data';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Button, Badge, Input, Nav, NavLink } from 'reactstrap';
import { Lists } from '../api/lists';


class Task extends Component {
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
    // mixpanel.track('Task set checked');
  }

  deleteThisTask() {
    Meteor.call('tasks.remove',  { taskId: this.props.task._id, listId: this.props.task.listId });
    // mixpanel.track('Task deleted');
  }

  togglePrivate() {
    Meteor.call('tasks.setPrivate', { taskId: this.props.task._id,  setToPrivate: !this.props.task.private });
    // mixpanel.track('Task set private');
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
        <li className={taskClassName}>
        { 
          <button 
            className="delete" 
            onClick={this.deleteThisTask}
          >
            &times;
          </button>
        }

          <Input
            type="checkbox"
            readOnly
            checked={this.state.checked}
            // value={this.state.checked}
            onClick={this.toggleChecked.bind(this)}
          />

          {
            this.props.showPrivateButton ? (
            <Button
              size="sm"
              className="toggle-private" 
              onClick={this.togglePrivate.bind(this)}
              color="primary"
            >
              { this.props.task.private ? 'Private' : 'Public' }
            </Button>
            ) : ''
          }
  
          {
            this.props.task.imageurl ?
            <Nav pills>
              <NavLink href={this.props.task.imageurl}>image</NavLink>
              <img src={this.props.task.imageurl} width='200' />
            </Nav>
            : '' 
          }

          { 
            this.props.task.imageurl1 ?
            <Nav pills>
              <NavLink href={this.props.task.imageurl1}>image</NavLink>
              <img src={this.props.task.imageurl1} width='200' />
            
            </Nav>
            : '' 
          }

          <span className="text">
            <Badge color="secondary">{' '}List:{' '}
              {this.props.lists.map(list => list._id === this.props.task.listId ? list.name  : '')}
            </Badge>
        
            <strong>
              <Badge> 
                {this.props.task.username} : {' '}
              </Badge>  
            </strong>

              {textNew}

            <strong className="text-warning">
              { 
                (this.props.task.dueDate) ? 
                <Badge> dueDate: </Badge> : ''
              }  
            </strong>

            {
              this.props.task.dueDate ? 
              moment.utc(this.props.task.dueDate).format('LLL')
              : '' 
            }
          </span>
        </li>
      </ReactCSSTransitionGroup>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe('lists');
  Meteor.subscribe('tasks');
  Meteor.subscribe('user');
 
  return {
    lists: Lists.find().fetch(),
    // tasks: Tasks.find().fetch(),
    currentUser: Meteor.user(),
 
  };
})(Task);