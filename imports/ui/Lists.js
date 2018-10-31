import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Button, Badge, ButtonGroup, Popover,  PopoverBody, Input, Form } from 'reactstrap';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import classnames from 'classnames';

export default class Lists extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedList: this.props.list.selected ? this.props.list.selected: '',
      popover: false,
      newListName:'',
      listName: this.props.list.name,
    };
    this.handleChangeListNmae = this.handleChangeListNmae.bind(this);
    this.toglePopover = this.toglePopover.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  handleChangeListNmae(e){
    e.preventDefault();
    this.setState({ newListName: e.target.value });
  }

  onSubmit(){
    Meteor.call('lists.update', { name: this.state.newListName, listId: this.props.list._id });
    // mixpanel.track('List name changed');
  }

  toglePopover(){
    this.setState({ popover: !this.state.popover});
  }

  deleteThisList(){
    Meteor.call('lists.remove', { listId: this.props.list._id });
    // mixpanel.track('List deleted');
  }

  selectThisList(){
    Meteor.call('lists.select', { listId: this.props.list._id }, (error) => {
      if (error && error.error ) {
        // this.toglePopover();
         console.log('ERRR,', error);
      }
    });
    // mixpanel.track('List selected');
  }
//this.props.list.ownerId === Meteor.user()._id || this.props.list.members.find(l => l.userId === this.userId ).userId === Meteor.user()._id
  render() {
    const taskClassName = classnames({
      listCheck: this.props.selected,
   });

    return (
      <ReactCSSTransitionGroup
        transitionName="example"
        transitionEnterTimeout={5000}
        transitionLeaveTimeout={5000}
        transitionAppear={true}
        transitionAppearTimeout={5000}
      >
        {  this.props.list.members.find(u => u.userId === Meteor.user()._id) ?
          <li className={taskClassName} id="place">
            <ButtonGroup>

            { this.props.list.members.find(u => u.userId === Meteor.user()._id && u.role ==='admin') ?
              <Button
                size="sm"
                color="primary"
                onClick={this.selectThisList.bind(this)}
              >
                Select
              </Button>
              : ''
            } 

            { this.props.list.members.find(u => u.userId === Meteor.user()._id && u.role ==='admin') ?
              <Button
                id="Update"
                size="sm"
                color="primary"
                onClick={this.toglePopover.bind(this)}
              >
                Update
              </Button>
              : ''
            }
           
              <Popover placement="auto-start" isOpen={this.state.popover} target="place" toggle={this.toglePopover}>
                <PopoverBody> New name :
                  <Form
                    onSubmit={this.onSubmit}
                  >
                    <Input
                      type="text"
                      placeholder="Type to update list"
                      value={this.state.newListName}
                      onChange={this.handleChangeListNmae.bind(this)}
                    />
                  </Form>
                </PopoverBody>
              </Popover>
              
            </ButtonGroup>{' '}

            <Badge>
              <strong> Name:{' '} </strong> {' '} {this.state.listName} {' '} 
            </Badge>

            <Badge>
              Owner name:{' '} {this.props.list.ownername}
            </Badge>

          { this.props.list.members.find(u => u.userId === Meteor.user()._id && u.role ==='admin') ?
            <button
              className="delete"
              onClick={this.deleteThisList.bind(this)}
            >
              x
            </button>
            : ''
          }
          </li> : '' }
      </ReactCSSTransitionGroup>
    );
  }
}

