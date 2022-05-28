import React, {useState} from "react";
import { Avatar, Button, Paper, Grid, Typography, Container, TextField } from "@material-ui/core";
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import useStyles from './styles';
import { useDispatch } from 'react-redux';
import { useHistory } from "react-router-dom";
import {signin, signup} from '../../actions/auth'

import Input from "./Input";
import Icon from "./Icon";

const initialState = {firstName: '', lastName: '', email: '', password: '', confirmPassword: ''}

const Auth = () => {
    const classes = useStyles();

    const [showPassword, setShowPassword] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState(initialState);

    const dispatch = useDispatch();
    const history = useHistory();

    const handleShowPassword = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword)
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if(isSignup) {
            dispatch(signup(formData, history));
        } else {
            dispatch(signin(formData, history));
        }
    }

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    }

    const switchMode = () => {
        setIsSignup((prevIsSignup) => !prevIsSignup)
        setShowPassword(false);
    }

    const googleSuccess = async (res) => {
        let result = null;
        const token = res?.credential;

        //https://github.com/anthonyjgrove/react-google-login/issues/502
        await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${res.credential}`)
        .then(res => res.json())
        .then(response => {
            result = response;
            //console.log('user info=', response)
        })
        .catch(error => console.log(error));

        //console.log(result);
        try {
            dispatch({type: 'AUTH', data: {result, token}});
            history.push('/')
        } catch (error) {
            console.log(error);
        }
    }

    const googleFailure = (error) => {
        console.log(error);
        console.log("Google Sign In was unsuccessful. Try Again");
    }

    return (
        <Container component="main" maxWidth="xs">
            <Paper className={classes.paper} elevation={3}>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography variant="h5">{isSignup ? 'Sign Up' : 'Sign In'}</Typography>
                <form className={classes.form} onSubmit={handleSubmit}> 
                    <Grid container spacing={2}>
                        {
                            isSignup && (
                                <>
                                    <Input name="firstName" label="First Name" handleChange={handleChange} autoFocus half />
                                    <Input name="lastName" label="Last Name" handleChange={handleChange} half />
                                </>
                            )
                        }
                        <Input name="email" label="Email Address" handleChange={handleChange} type="email"/>
                        <Input name="password" label="Password" handleChange={handleChange} type={showPassword ? "text" : "password"} handleShowPassword={handleShowPassword}/>
                        {isSignup && <Input name="confirmPassword" label="Repeat Password" handleChange={handleChange} type="password"/>}
                    </Grid>
                    <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit}>
                        {isSignup ? 'Sign Up' : 'Sign In'}
                    </Button>
                    <GoogleOAuthProvider clientId={process.env.REACT_APP_API_KEY}>
                        {!isSignup && (<GoogleLogin   //change this
                            size="medium"
                            onSuccess={googleSuccess}
                            onFailure={googleFailure} 
                            cookiePolicy="single_host_origin"
                        />)}
                    </GoogleOAuthProvider>
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <Button onClick={switchMode}>
                                {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
}

export default Auth;