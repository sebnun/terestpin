import React, { Component } from 'react';
import { firebaseApp, getLocalUserId } from '../firebase';

import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ContentClear from 'material-ui/svg-icons/content/clear';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import Masonry from 'react-masonry-component';
import IconButton from 'material-ui/IconButton';

class Dashboard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showDialog: false,
            title: '',
            url: '',
            urlError: '',
            pins: [] //{title: '', url: '', id: ''}
        }

        this.handleClose = this.handleClose.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleAdd = this.handleAdd.bind(this);
        this.handleImageError = this.handleImageError.bind(this);
        this.handleImageLoad = this.handleImageLoad.bind(this);

        this.pinsRef = firebaseApp.database().ref('pins');
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.recent) {

            this.pinsRef.on('value', (snapshot) => {
                if (snapshot.val()) {
                    this.setState({ pins: this.toPinsArray(snapshot.val()) });
                } else {
                    console.log('no recent pins');
                    this.setState({ pins: [] });
                }
            }).bind(this);

        } else {
            //uid changes, so gotta init here
            this.userPinsRef = firebaseApp.database().ref('user-pins/' + getLocalUserId());

            this.userPinsRef.on('value', (snapshot) => {
                if (snapshot.val()) {
                    this.setState({ pins: this.toPinsArray(snapshot.val()) });
                } else {
                    console.log('no my pins');
                    this.setState({ pins: [] });
                }
            }).bind(this);
        }
    }

    toPinsArray(snapVal) {
        const pins = [];

        Object.keys(snapVal).forEach(key => {
            pins.push({ title: snapVal[key].title, url: snapVal[key].url, id: key })
        });

        return pins
    }

    handleClose() {
        this.setState({ showDialog: false, url: '', title: '', urlError: '' })
    }

    handleOpen() {
        this.setState({ showDialog: true, url: '', title: '', urlError: '' })
    }

    handleAdd() {
        if (this.state.urlError === '') {

            const title = this.state.title || 'no title'; //'' is falsy
            const pinData = {
                title,
                url: this.state.url
            }

            const newPinKey = firebaseApp.database().ref().child('pins').push().key;
            let updates = {};
            updates['/pins/' + newPinKey] = pinData;
            updates['/user-pins/' + firebaseApp.auth().currentUser.uid + '/' + newPinKey] = pinData;

            firebaseApp.database().ref().update(updates);
        }

        this.setState({ showDialog: false })
    }

    handleDelete(pinId) {
        let updates = {};
        updates['/pins/' + pinId] = null;
        updates['/user-pins/' + firebaseApp.auth().currentUser.uid + '/' + pinId] = null;

        firebaseApp.database().ref().update(updates);
    }

    handleImageError() {
        if (this.state.url.length > 0)
            this.setState({ urlError: 'This image is broken.' })
    }

    handleImageLoad() {
        this.setState({ urlError: '' })
    }

    handleTitleChange = (event) => {
        this.setState({
            title: event.target.value,
        });
    };

    handleURLChange = (event) => {
        this.setState({
            url: event.target.value,
        });
    };

    render() {

        const actions = [
            <FlatButton
                label="Cancel"
                onTouchTap={this.handleClose}
                />,
            <FlatButton
                label="Add"
                primary={true}
                keyboardFocused={true}
                onTouchTap={this.handleAdd}
                />,
        ];

        return (


            <div className="col-sm-12 text-xs-center">


                <Dialog
                    title="Add Pin"
                    actions={actions}
                    open={this.state.showDialog}
                    onRequestClose={this.handleClose}
                    >
                    <div className="text-xs-center">
                        <TextField
                            hintText="Title"
                            value={this.state.title}
                            onChange={this.handleTitleChange}
                            />
                        <br /> <br />
                        <TextField
                            hintText="URL"
                            errorText={this.state.urlError}
                            value={this.state.url}
                            onChange={this.handleURLChange}
                            />
                        <br /> <br />

                        <img src={this.state.url} onError={this.handleImageError} onLoad={this.handleImageLoad} alt={this.state.title} />
                    </div>
                </Dialog>

                <br />
                <h3>{this.props.recent ? 'Recent Pins' : 'My Pins'}</h3>
                <br />
                {!this.props.recent ?
                    <FloatingActionButton onTouchTap={this.handleOpen}>
                        <ContentAdd />
                    </FloatingActionButton>
                    : ''}
                <br /><br />


                <Masonry>

                    {this.state.pins.map(pin => {
                        return (
                            <div key={pin.id}>
                                <Paper style={{ padding: 10, margin: 10 }}>
                                    <h5>{pin.title}</h5>  
                                    {!this.props.recent ?
                                        <IconButton onTouchTap={this.handleDelete.bind(this, pin.id)}><ContentClear /></IconButton>
                                        :
                                        ''
                                    }
                                    <img src={pin.url} alt={pin.title} />
                                </Paper>
                            </div>
                        )
                    })}

                </Masonry>

            </div>
        )
    }
}

export default Dashboard;