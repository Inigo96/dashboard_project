// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'        : 'your-secret-clientID-here', // your App ID
        'clientSecret'    : 'your-client-secret-here', // your App Secret
        'callbackURL'     : 'http://localhost:8080/auth/facebook/callback',
        'profileURL': 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        'profileFields'   : ['id', 'email', 'name'] // For requesting permissions from Facebook API

    },

    'twitterAuth' : {
        'consumerKey'        : 'your-consumer-key-here',
        'consumerSecret'     : 'your-client-secret-here',
        'callbackURL'        : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'         : '930540559855-9bl139dr79chhbh1i5qce3qnfgj2miq3.apps.googleusercontent.com',
        'clientSecret'     : 'YZmHUktjcQOZXPHpmoMrQP30',
        'callbackURL'      : 'https://rocky-peak-85212.herokuapp.com/auth/google/callback'
    }

};
//https://console.developers.google.com/apis/credentials/oauthclient/930540559855-9bl139dr79chhbh1i5qce3qnfgj2miq3.apps.googleusercontent.com?project=web-management-190405