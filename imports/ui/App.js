import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Form, FormGroup, Input, Popover,  PopoverBody } from 'reactstrap';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Elements, StripeProvider } from 'react-stripe-elements';
import Modal from 'react-modal';

import { Meteor } from 'meteor/meteor';
import { Tasks } from '../api/tasks.js';
import { Lists } from '../api/lists.js';
import { Payments } from '../api/payments.js';

import Task from './Task.js';
import List from './Lists.js';
import Payment from './Payments.js';
import CheckoutForm from './CheckoutForm';
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
        filesUpload: 0,
        imageurl: '',
        imageurl1: '',

        listsAllow: this.props.currentUser && this.props.currentUser.listsAllow,
        tasksAllow: this.props.currentUser && this.props.currentUser.tasksAllow,

        calendarModalIsOpen: false,
        listModalIsOpen: false,
        taskModalIsOpen: false,
        filesModalIsOpen: false,

        inputFile: '',
      };

      this.toggleHideCompleted = this.toggleHideCompleted.bind(this);
      this.toggleSendTocalendar = this.toggleSendTocalendar.bind(this);
      this.toglePopover = this.toglePopover.bind(this);

      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleChangeList = this.handleChangeList.bind(this);
      this.handleSubmitList = this.handleSubmitList.bind(this);
      this.handleListName = this.handleListName.bind(this);

      this.openModal = this.openModal.bind(this);
      this.closeModal = this.closeModal.bind(this);

    }

    componentWillMount() {
      Modal.setAppElement('body');
    }

    componentDidUpdate(prevProps) {
      if (!prevProps.currentUser && this.props.currentUser) {
        this.setState({ hideChecked: this.props.currentUser && this.props.currentUser.profile && this.props.currentUser.profile.hideChecked });
        // this.setState({ selectedList: this.this.props.currentUser && this.props.currentUser.profile &&  this.props.currentUser.profile.selectedListId});
      }
    }
    
    async handleSubmit(event) {
      event.preventDefault();

      if (this.props.currentUser && !this.props.currentUser.selectedListId) throw new Error('List isn`t select');
      
      if (this.props.currentUser && this.props.currentUser.tasksAllow === 0){
        this.setState({ taskModalIsOpen: true });
      } else {   
        
        const task = {
          text: this.state.todoText, 
          sendToCalendar: this.state.sendToCalendar,
          listId: this.props.currentUser ? this.props.currentUser.selectedListId : '' 
        };

        const uploader = new Slingshot.Upload("myFileUploads");
        
        let inputFile = document.getElementById('avatar').files;

        inputFile && this.setState({ inputFiles: inputFile.length });
        
        if (this.props.currentUser) {
          inputFile[0] && inputFile[0] && await new Promise((resolve, reject) => {
            uploader.send(inputFile[0], (error, downloadUrl) => {
              if (error) {
                console.error('Error uploading', /* uploader.xhr.response */ error);
                alert (error);
                reject(error);
              } else {
                this.state.imageurl = downloadUrl; 
                task.imageurl = downloadUrl;
              } 
              resolve();
            });
          });
    
          inputFile[1] && inputFile[1] && await new Promise((resolve, reject) => {
            uploader.send(inputFile[1], (error, downloadUrl) => {
              if (error) {
                console.error('Error uploading', /* uploader.xhr.response */ error);
                alert (error);
                reject(err);
              } else {
                this.state.imageurl1 = downloadUrl;
                task.imageurl1 = downloadUrl;
              } 
              resolve();
            });
          });
        }

        Meteor.call('tasks.insert', task,
        (error) => {
          if (error && error.error) {
            this.toglePopover();
            console.log('ERRR,', error);
          }
        });
        this.setState({ todoText: '' });
      }
    }

    handleSubmitList(event) {
      event.preventDefault();
      if (this.props.currentUser && this.props.currentUser.listsAllow === 0) {
        this.setState({ listModalIsOpen: true });
      } else {
        Meteor.call('lists.create', { listName: this.state.listName });
        this.setState({ listName:'' });
      }
    }

    openModal() {
      this.setState({ modalIsOpen: true });
    }
  
    closeModal() {
      this.setState({      
        calendarModalIsOpen: false,
        listModalIsOpen: false,
        taskModalIsOpen: false,
        filesModalIsOpen: false
      });
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
        calendarModalIsOpen: !this.state.calendarModalIsOpen
      });
    }
    
    renderPayments() {
      if (this.props.payments) {
        return this.props.payments.map((payment) => {
        return (
          <Payment payment={payment}/>
        );
      });
      }
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
      
    const { loading } = this.props;

    if (loading) return null;
    return (
      <ReactCSSTransitionGroup
        transitionName="example"
        transitionEnterTimeout={5000}
        transitionLeaveTimeout={5000}
        transitionAppear={true}
        transitionAppearTimeout={5000}
      >
        <Modal
          isOpen={this.state.listModalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          contentLabel="Buy a list"
        >
          <button onClick={this.closeModal}>close</button>
          <StripeProvider apiKey={Meteor.settings.public.stripePublicToken}>
            <div className="example">
              <h1>Pay for buing addition list</h1>
              <Elements>
                <CheckoutForm 
                  reason={'listBuy'} 
                  listName={this.state.listName} 
                  close={this.closeModal} 
                />
              </Elements>
            </div>
          </StripeProvider>
        </Modal>

        <Modal
          isOpen={this.state.taskModalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          contentLabel="Buy a task"
        >
          <button onClick={this.closeModal}>close</button>
          <StripeProvider apiKey={Meteor.settings.public.stripePublicToken}>
            <div className="example">
              <h1>Pay for buing addition task</h1>
              <h2>{}</h2>
              <Elements>
                <CheckoutForm
                  close={this.closeModal}
                  reason={'taskBuy'} 
                  sendToCalendar={this.state.sendToCalendar} 
                  filesUpload={this.state.filesUpload}
                  todoText={this.state.todoText}
                  listId={this.props.currentUser ? this.props.currentUser.selectedListId : ''}
                  file={this.state.inputFile}
                  imageurl={this.state.imageurl}
                  imageurl1={this.state.imageurl1}
                />
              </Elements>
            </div>
          </StripeProvider>
        </Modal>

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
                    <input
                      type="file"
                      id="avatar" 
                      name="avatar"
                      accept="image/png, image/jpeg"
                      multiple
                      onChange={({ target }) => this.setState({ filesUpload: target.files.length })}
                    />
                    <Popover 
                      placement="bottom" 
                      isOpen={this.state.popover} 
                      target="taskText" 
                      toggle={this.toglePopover}
                    >
                      <PopoverBody>
                        You should select task-list before insert a new task{' '}
                      </PopoverBody>
                    </Popover>
                  </FormGroup>
                </Form> 
              : ''  
            }
            </header>

          <div>
           
            <ul>
              {this.renderTasks()}
            </ul>
          </div>
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


          {this.props.currentUser
          ? <div className="payments-container">
            <h1>Payments</h1>
              <ul>
                { this.renderPayments() }
              </ul>
            </div> : ''}
        </div>
      </ReactCSSTransitionGroup>
    );
  }
}

export default withTracker(() => {
  const tasksSub = Meteor.subscribe('tasks');
  const listsSub = Meteor.subscribe('lists');
  const userSub = Meteor.subscribe('user');
  const paymentsSub  = Meteor.subscribe('payments');

  return {
    payments: Payments.find({}, { sort: { createdAt: -1 } }).fetch(),
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
    lists: Lists.find({}, { sort: { createdAt: -1 } }).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user(),
    loading: !tasksSub.ready() || !listsSub.ready() || !userSub.ready() || !paymentsSub.ready()
  };
})(App);
