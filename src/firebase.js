import * as firebase from 'firebase';

const config = {
    apiKey: "AIzaSyAN6dtMqsKK-mDHXKUVnZoWtYZ9jJpP9tw",
    authDomain: "terestpin-89a31.firebaseapp.com",
    databaseURL: "https://terestpin-89a31.firebaseio.com",
    storageBucket: "terestpin-89a31.appspot.com",
};

export const firebaseApp = firebase.initializeApp(config);

export function getLocalUserId() {
    let uid;

    //this key exists if the user is logged in, when logged out is removed
    //the user should be authoraized when seeing the dashboard
    //use it to avoid waiting for firebaseApp.auth().onAuthStateChanged
    for (let key in localStorage) {
        if (key.startsWith('firebase:authUser:')) {
            uid = JSON.parse(localStorage.getItem(key)).uid;
            break;
        }
    }

    return uid;
}
