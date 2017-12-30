module.exports = function(app, passport) {

    app.get(`/`, (req, res) => {
    	    res.render("index");
    	});

	app.get(`/dashboard`,isLoggedIn, (req, res) => {
	    //res.render('keyword', { title: 'Control panel', user: 'Ini' });
        //console.log(req.sessionID)
        //console.log()
        //res.sendfile('./views/index2.html')
       var client = req.app.get('elastic');
       client.search({
         index: 'logs'
       },function (error, response,status) {
           var arr = [];
           if (error){
             console.log("search error: "+error)
           }
           else {
//             console.log("--- Response ---");
//             console.log(response);
//             console.log("--- Hits ---");
             response.hits.hits.forEach(function(hit){
               arr.push(hit['_type'])
             })
             let unique = [...new Set(arr)];
             console.log(unique)
             res.render("dashboard", {list: JSON.stringify(unique),user: req.user});
           }
       });
	});

    app.get(`/predict_csv`,isLoggedIn, (req, res) => {
    	res.render('predict_csv', { user: req.user });
    });

//    app.get(`/socket`, (req, res) => {
//        	res.render('socket');
//        });

   // LOGOUT ==============================
       app.get('/logout', function(req, res) {
           req.logout();
           res.redirect('/');
       });



    app.get(`/dasboard_highcharts/:tagId`,isLoggedIn, (req, res) => {
        //res.send("tagId is set to " + req.params.tagId);
        time = ((new Date()).getTime() - 3600000) //86400000)
        console.log(time)
        var client = req.app.get('elastic');
               client.search(
               {
                 from : 0, size : 10000,
                 index: 'logs',
                 type: req.params.tagId,
                 body:{
                     query: {
                             range : {
                                 'date' : {
                                     gte : time,
                                     lt : 1599540884590
                                 }
                             }
                     }
//                     ,
//                     sort: [{ 'date':   { order: 'desc' }}]
                 }
//                 sort : {
//                    post_date : {
//                    order : asc
//                    }
//                 }
               },function (error, response,status) {
                   var arr = [];
//                   var arr1 = [];
//                   var arr2= [];
                   var previous
                   if (error){
                     console.log("search error: "+error)
                   }
                   else {
//                     console.log("--- Response ---");
//                     console.log(response);
//                     console.log("--- Hits ---");
                     response.hits.hits.forEach(function(hit){
                       if (hit['_source']['MEM_usage'] != null){
//                           console.log([hit['_id'], hit['_source']['CPU_sum']]);
                           arr.push([hit['_source']['date'], hit['_source']['MEM_usage']]);
//                           arr2.push(hit['_source']['CPU_sum']);
//                           arr1.push(hit['_source']['date']);
                       }
                     })
                   arr.sort(sortFunction);

                   function sortFunction(a, b) {
                       if (a[0] === b[0]) {
                           return 0;
                       }
                       else {
                           return (a[0] < b[0]) ? -1 : 1;
                       }
                   }

//                   arr.forEach(function(element) {
//                       console.log(element);
//                   });

                   res.render('highcharts', { server: req.params.tagId, arr: JSON.stringify(arr), user: req.user});
                   }
               });

    });


// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // google ---------------------------------

        // send to google to do the authentication
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

        // the callback after google has authenticated the user
        app.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect : '/dashboard',
                failureRedirect : '/'
            }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
    app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
    }));

    // google ---------------------------------
    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

    // the callback after google has authorized the user
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect : '/dashboard',
            failureRedirect : '/'
        }));


    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future
    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
            var user            = req.user;
            user.local.email    = undefined;
            user.local.password = undefined;
            user.save(function(err) {
                res.redirect('/dashboard');
            });
        });
    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function(req, res) {
            var user          = req.user;
            user.google.token = undefined;
            user.save(function(err) {
                res.redirect('/dashboard');
            });
        });

};

// Functions
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
