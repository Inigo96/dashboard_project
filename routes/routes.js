module.exports = app => {

	app.get(`/`, (req, res) => {
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
             res.render("dashboard", {list: JSON.stringify(unique)});
           }
       });
	});

    app.get(`/predict_csv`, (req, res) => {
    	res.render('predict_csv', { title: 'Control panel', user: 'Ini' });
    });

    app.get(`/dasboard_highcharts/:tagId`, (req, res) => {
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

                   res.render('highcharts', { server: req.params.tagId, arr: JSON.stringify(arr)});
                   }
               });

    });

};

// Functions
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    req.session.returnTo = req.path;
    res.redirect('/login');
}
