import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Button, Badge, ButtonGroup, Popover,  PopoverBody, Input } from 'reactstrap';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import classnames from 'classnames';

export default class Lists extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedList: this.props.list.selected ? this.props.list.selected: '',
      popover: false,
      newListName:'',
    };
    this.handleChangeListNmae.bind(this);
    this.toglePopover.bind(this);
  }

  handleChangeListNmae(e){
    this.setState({newListName: e.target.value});
  }

  toglePopover(){
    this.setState({popover: !this.state.popover});
  }

  deleteThisList(){
    Meteor.call('lists.remove', {listId: this.props.list._id});
  }

  selectThisList(){
    Meteor.call('lists.select', { listId: this.props.list._id });
  }

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
        { this.props.list.owner === Meteor.user()._id ?
          <li className={taskClassName}>
            <ButtonGroup>
              <Button
                size="sm"
                color="primary"
                onClick={this.selectThisList.bind(this)}
              >
                Select
              </Button>
              <Button
                id="Update"
                size="sm"
                color="primary"
                onClick={this.toglePopover.bind(this)}
              >
              Update
              </Button>
              <Popover placement="bottom" isOpen={this.state.popover} target="Update" toggle={this.toglePopover}>
                <PopoverBody>New list name : 
                  <Input
                    type="text"
                    placeholder="Type to change list name"
                    value={this.state.newListName}
                    onChange={this.handleChangeListNmae.bind(this)}
                  />
                </PopoverBody>
              </Popover>
            </ButtonGroup>
            <Badge>
              <strong>  Name:  </strong>  {this.props.list.name}
            </Badge>
            <button
              className="delete"
              onClick={this.deleteThisList.bind(this)}
            >
              x
            </button>
          </li> : '' }
      </ReactCSSTransitionGroup>
    );
  }
}
