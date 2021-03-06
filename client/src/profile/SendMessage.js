import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios'

import history from '../utils/history'

import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

class SendMessage extends Component {
  handleSubmit = (e) => {
    e.preventDefault()
    const message_sender = this.props.db_profile[0].username
    const message_recipient = this.props.location.state.props.profile.username
    const message_title = e.target.title.value
    const message_body = e.target.body.value

    const data = {
      message_sender,
      message_recipient,
      message_title,
      message_body
    }

    axios.post('/api/post/messagetodb', data)
      .then(res => console.log("SendMessage.js", res))
      .then(setTimeout(() => history.replace('/'), 500))
      .catch(err => console.error(err))
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <TextField
            id="title"
            label="Title"
            margin="normal"
          />
          <br />
          <TextField
            id="body"
            multiline
            rows="4"
            margin="normal"
          />
          <br />
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
          <Button onClick={() => history.replace('/')}>
            Cancel
          </Button>
        </form>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    db_profile: state.auth_reducer.db_profile,
  }
}

function mapDispatchToProps(dispatch) {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SendMessage)
