var https     = require('https');
var async     = require('async');
var apiUrl    = 'api.github.com';


exports.getRepoList = function(account, callback){
  
  var options = {
     host: apiUrl,
     port: 443,
     path: '/user/repos',
     // authentication headers
     headers: {
        'Authorization': 'Basic ' + new Buffer(account.username + ':' + account.password).toString('base64')
     }   
  };
  
  //this is the call
  var request = https.get(options, function(res){
     var body = "";
     
     res.on('data', function(data) {
        body += data;
     });
     
     res.on('end', function() {
      
        var json = JSON.parse(body);   
        var repos = [];
        
        json.forEach(function(obj){
          repos.push(obj.name);
        });
  
        callback(repos)
     });
  
     res.on('error', function(e) {
        console.log("Got error: " + e.message);
     });
    
  });
}

exports.getCommits1 = function(account, user, repoList, callbackFn){

  var commits = [];
  
  var getCommits = function(repo, callback){
    var options = {
      host: apiUrl,
      port: 443,
      path: '/repos/' + user.login + '/'+ repo +'/commits',
      // authentication headers
      headers: {
        'Authorization': 'Basic ' + new Buffer(account.username + ':' + account.password).toString('base64')
      }   
    };
  
  //this is the call
    var request = https.get(options, function(res){
      var body = "";
     
      res.on('data', function(data) {
        body += data;
      });
        
      res.on('end', function() {
        
        var json = JSON.parse(body);   
        if (!json){
          console.log('Json is null');
          return;
        }
        json.forEach(function(obj){
          if (obj.commit.committer &&  obj.commit.committer.email.toLowerCase() === user.email.toLowerCase())
            commits.push(new Date(obj.commit.committer.date));
        });
        
        callback();
      });
        
      res.on('error', function(e) {
        console.log("Got error: " + e.message);
      });
      
    });
  }
  
  
  async.each(repoList, getCommits, function(err){
          
    if (err){
      console.log('async.foreach error::')
      console.log(err);
      return;
    }
    //Sort the commit dates
    commits.sort(function(a,b){
      return a<b ? -1 :a > b ? 1:0;
    });
    callbackFn(commits)
    
  });

}


exports.getUserInfo = function(account, callback){
  
  var options = {
     host: apiUrl,
     port: 443,
     path: '/user',
     // authentication headers
     headers: {
        'Authorization': 'Basic ' + new Buffer(account.username + ':' + account.password).toString('base64')
     }   
  };
  
  //this is the call
  var request = https.get(options, function(res){
     var body = "";
     
     res.on('data', function(data) {
        body += data;
     });
     
     res.on('end', function() {
      
      callback( JSON.parse(body) );

     });
  
     res.on('error', function(e) {
        console.log("Got error: " + e.message);
     });
    
  });
}



