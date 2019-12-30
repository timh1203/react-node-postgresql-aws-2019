import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as ACTIONS from '../store/actions/actions'
import axios from 'axios'

import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'

class ShowPost extends Component {
  constructor(props) {
    super(props)

    this.state = {
      open: false,
      comment: '',
      cid: '',
      opacity: 0,
      comments: [],
      comments_motion: [],
      delete_comment_id: 0,
    }
  }

  componentDidMount() {
    axios.get('/api/get/allpostcomments', { params: { post_id: this.props.location.state.post.post.pid } })
      .then(res => this.props.set_comments(res.data))
      .catch(err => console.error(err))
    this.handleTransition()
  }

  // RENDER FUNCTIONS
  RenderComment = (comment) => (
    <div className={this.state.delete_comment_id === comment.comment.cid ? "FadeOutComment" : "CommentStyles"}>
      <h3>{comment.comment.comment}</h3>
      <small>{comment.comment.date_created === 'Just Now' ? <span>Edited</span> : <span>Just Now</span>}</small>
      <p>By: {comment.comment.author}</p>
      {comment.cur_user_id === comment.comment.user_id ? (
        <Button onClick={() => this.handleClick(comment.comment.id, comment.comment.comment)}>
          Edit
        </Button>
      ) : ''}
    </div>
  )

  // ANIMATION FUNCTIONS
  handleTransition = () => {
    setTimeout(() => this.setState({ opacity: 1 }), 400)
  }

  addCommentsToState = (comments) => {
    this.setState({ comments: [...comments] })
    this.animateComments()
  }

  animateComments = () => {
    let i = 1
    return this.state.comments.map(comment => {
      setTimeout(() => this.setState({ comments_motion: [...this.state.comments_motion, comment] }), 400 * i)
      return i++
    })
  }

  handleCommentSubmit = (submitted_comment) => {
    setTimeout(() => this.setState({
      comments_motion: [submitted_comment, ...this.state.comments_motion]
    }), 50)
  }

  handleCommentUpdate = (comment) => {
    const commentIndex = this.state.comments_motion.findIndex(item => item.id === comment.cid)
    let newArr = [...this.state.comments_motion]
    newArr[commentIndex] = comment
    this.setState({ comments_motion: newArr })
  }

  handleCommentDelete = (cid) => {
    this.setState({ delete_comment_id: cid })
    const newArr = this.state.comments_motion.filter(item => item.cid !== cid)
    setTimeout(() => this.setState({ comments_motion: newArr }), 2000)
  }

  // FORM FUNCTIONS
  handleClickOpen = (cid, comment) => {
    this.setState({ open: true, comment, cid })
  }

  handleClickClose = () => {
    this.setState({ open: false, comment: '', cid: '' })
  }

  handleChange = (e) => {
    this.setState({ comment: e.target.value })
  }

  handleUpdate = () => {
    const comment = this.state.comment
    const cid = this.state.cid
    const user_id = this.props.db_profile[0].uid
    const post_id = this.props.location.state.post.post.pid
    const username = this.props.db_profile[0].username
    const date_created = "Just Now"
    const data = { comment, cid, post_id, user_id, username }
    const edited_comment = {
      cid,
      comment,
      post_id,
      user_id,
      author: username,
      date_created,
      isEdited: true
    }

    axios.put('/api/put/commenttodb', data)
      .then(res => console.log(res))
      .catch(err => console.error(err))
    this.handleCommentUpdate(edited_comment)
  }

  handleDelete = () => {
    const cid = this.state.cid

    axios.delete('/api/delete/commenttodb', { data: { cid } })
      .then(res => console.log(res))
      .catch(err => console.error(err))

    this.handleCommentDelete(cid)
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.setState({ comment: '' })
    const comment = e.target.comment.value
    const user_id = this.props.db_profile[0].uid
    const post_id = this.props.location.state.post.post.pid
    const username = this.props.db_profile[0].username
    const temp_cid = Math.floor(Math.random() * 100000000000)
    const date_created = 'Just Now'

    const data = { comment, post_id, user_id, username }
    const submitted_comment = {
      cid: temp_cid,
      comment,
      user_id,
      author: username,
      date_created
    }

    axios.post('/api/post/commenttodb', data)
      .catch(err => console.error(err))
    window.scroll({ top: 0, left: 0, behavior: 'smooth' })
    this.handleCommentSubmit(submitted_comment)
  }


  render() {
    return (
      <div>
        <div>
          <h2>Post</h2>
          <h4>{this.props.location.state.post.post.title}</h4>
          <p>{this.props.location.state.post.post.body}</p>
          <p>{this.props.location.state.post.post.author}</p>
        </div>
        <div style={{ opacity: this.state.opacity, transition: 'ease0out 2s' }}>
          <h2>Comments:</h2>
          {this.state.comments_motion ? (
            this.state.comments_motion.map(comment => (
              <this.RenderComment
                key={comment.cid}
                comment={comment}
                cur_user_id={this.props.db_profile[0].uid}
              />
            ))
          ) : ''}
        </div>
        <div>
          <form onSubmit={this.handleSubmit}>
            <TextField
              id="comment"
              label="Comment"
              margin="normal"
              value={this.state.comment}
              onChange={this.handleChange}
            />
            <br />
            <Button type="submit">Submit</Button>
          </form>
        </div>
        <div>
          <Dialog
            open={this.state.open}
            onClose={this.handleClickClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">Edit Comment</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description" >
                <input type="text" value={this.state.comment} onChange={this.handleChange} />
              </DialogContentText>
              <DialogActions>
                <Button onClick={() => { this.handleUpdate(); this.setState({ open: false }) }}>
                  Agree
                </Button>
                <Button onClick={() => this.handleClickClose()}>
                  Cancel
                </Button>
                <Button onClick={() => this.handleDelete()}>
                  Delete
                </Button>
              </DialogActions>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    comments: state.posts_reducer.comments,
    db_profile: state.auth_reducer.db_profile
  }
}

function mapDispatchToProps(dispatch) {
  return {
    set_comments: (comments) => dispatch(ACTIONS.fetch_post_comments(comments))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ShowPost)
