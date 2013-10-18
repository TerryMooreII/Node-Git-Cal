
var async     = require('async');
var read      = require('read');
var hn        = require('./service-functions');
var hnDisplay = require('./display-functions');

var account   = {};


function init(){
  async.waterfall([
    
    function(callback){
      read({ prompt: 'Username: '}, function(er, username) {
        account.username = username;
        callback()
      })
    },

    function(callback){
      read({ prompt: 'Password: ', silent: true, replace: '***'}, function(er, password) {
        account.password = password;
        callback()
      })
    }, 
    
    function(callback){
      hn.getUserInfo(account, function(user){
        if (user.login){
          callback(null, user);
        }else{
          if (user.message)
            callback(user.message);
          else
            callback('Invalid user name and/or password');
        }
          
      });
    },
    
    function(user, callback){
      
      hn.getRepoList(account, function(repoList){

        if(repoList){
          callback(null, user,  repoList);
        }else
          callback('User ' + user.login + ' has zero repositories');
      });
      
    },
    function(user, repoList, callback){

      hn.getCommits1(account, user, repoList, function(commits){

        callback(null, commits);
      })
    }, 
    function(commits){
      var fullCalendar = hnDisplay.mergeDatesAndCommits(commits);
      var sortedCommitsByDayOfWeek = hnDisplay.sortCommitsByDayOfWeek(fullCalendar);
      hnDisplay.display(sortedCommitsByDayOfWeek);
    }
  ], function(err){
      if(err){
        console.log('Error :: ');
        console.log(err);
      }
  })
}


init();



