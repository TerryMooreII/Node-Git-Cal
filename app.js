var https     = require('https');
var async     = require('async');
var xcolor    = require('xcolor');
var read      = require('read');

var repos     = [];
var commits   = [];
var account   = {};
var apiUrl    = 'api.github.com';
var emailAddress = 'terry.moore.ii@gmail.com';
var userName  = 'TerryMooreII'

function mergeDatesAndCommits(){
  var now = new Date(Date.now());
  var daysOfYear = [];
  var merged = [];
 
  //get array of all days for the past year
  for (var d = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() ); d <= now; d.setDate(d.getDate() + 1)) {
      daysOfYear.push(new Date(d));
  }

  //create array of days and the number of commits for that day.
  for (var j=0; j< daysOfYear.length; j++){
    
    var curDay = daysOfYear[j];
    var numOfCommits =0;

    for (var i=0; i< commits.length; i++){
      
      var commit = commits[i];
      var day = new Date(commit.getFullYear(), commit.getMonth(), commit.getDate());

      if (curDay !== undefined && curDay.getTime() === day.getTime()){
      
        numOfCommits++;
        curDay = day;
      }else{
        merged[curDay] = numOfCommits;
      }
    }
  }
  
  return merged;
}

function getRepoList(){
  
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
      
        json.forEach(function(obj){
          repos.push(obj.name);
        });
  
        
        async.each(repos, getCommits, function(err){
          
          if (err){
            console.log(err);
            return;
          }
          //Sort the commit dates
          commits.sort(function(a,b){
            return a<b ? -1 :a > b ? 1:0;
          });
          
          var fullCalendar = mergeDatesAndCommits();
          var sortedCommitsByDayOfWeek = sortCommitsByDayOfWeek(fullCalendar);
          display(sortedCommitsByDayOfWeek);
         });      
     });
  
     res.on('error', function(e) {
        console.log("Got error: " + e.message);
     });
    
  });
}

function getCommits(repo, callback){
  var options = {
    host: apiUrl,
    port: 443,
    path: '/repos/' + userName + '/'+ repo +'/commits',
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
      
      json.forEach(function(obj){
        if (obj.commit.committer &&  obj.commit.committer.email.toLowerCase() === emailAddress)
          commits.push(new Date(obj.commit.committer.date));
      });
    
      callback();
    
    });
      
    res.on('error', function(e) {
      console.log("Got error: " + e.message);
    });
    
  });

}

function sortCommitsByDayOfWeek(counts){

  var mon   = []; 
  var tues  = []; 
  var wed   = []; 
  var thurs = []; 
  var fri   = []; 
  var sat   = []; 
  var sun   = [];
  var isSet = false;
  var firstDayOfCal;
  
  for (var key in counts){
    
    if (!isSet){
      isSet=true
      firstDayOfCal = new Date(key).getDay();      
    }
    
    switch (new Date(key).getDay()){
      case 0:
        sun.push(counts[key]);
        break;
      case 1:
        mon.push(counts[key]);
        break;
      case 2:
        tues.push(counts[key]);
        break;
      case 3:
        wed.push(counts[key]);
        break;
      case 4:
        thurs.push(counts[key]);
        break;
      case 5:
        fri.push(counts[key]);
        break;
      case 6:
        sat.push(counts[key]);
        break;
      default:
        console.log('you messed up')
    }
  };
  return {
    firstDayOfCal: firstDayOfCal,
    mon: mon,
    tues: tues,
    wed: wed,
    thurs: thurs,
    fri: fri,
    sat: sat,
    sun: sun
  };
}

function display(commitsByDayOfWeek){
  
  console.log('');
   //The if statement determines if a spacer is needed to line up dates in cal.
  console.log(displayMonthTitle())
  xcolor.log('     ' + displayCommits(commitsByDayOfWeek.sun, commitsByDayOfWeek.firstDayOfCal > 0 ? true : false)); 
  xcolor.log(' Mon ' + displayCommits(commitsByDayOfWeek.mon, commitsByDayOfWeek.firstDayOfCal > 1 ? true : false));
  xcolor.log('     ' + displayCommits(commitsByDayOfWeek.tues, commitsByDayOfWeek.firstDayOfCal > 2 ? true : false));
  xcolor.log(' Wed ' + displayCommits(commitsByDayOfWeek.wed, commitsByDayOfWeek.firstDayOfCal > 3 ? true : false));
  xcolor.log('     ' + displayCommits(commitsByDayOfWeek.thurs, commitsByDayOfWeek.firstDayOfCal > 4 ? true : false));
  xcolor.log(' Fri ' + displayCommits(commitsByDayOfWeek.fri, commitsByDayOfWeek.firstDayOfCal
  > 5 ? true : false));
  xcolor.log('     ' + displayCommits(commitsByDayOfWeek.sat, commitsByDayOfWeek.firstDayOfCal > 6 ? true : false));
  console.log('');
  
}


function displayMonthTitle(){
  var months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

  var end = 11; //Months are zero based
  var start = new Date().getMonth() + 1;
  var stop = false;
  var row='\t    '; 

  for (var i = start; i <= end; i++ ){
    row += months[i] + '\t    ';
  
    if (i === end){
      var end2 = start -1;

      for (var j = 0; j <= end2; j++ ){
         row += months[j] + '\t    ';
      }      
    }
  }
  return row;

}

function displayCommits(day, spacer){
 
  var row = '';
  
  //Leaves a blank space to line up the days
  if (spacer)
    row = '  '

  var char = '\u25A9'; //square
  
  day.forEach(function(commitCount){

    if (commitCount === 0)
      row += '{{#222222}}' + char;

    else if (commitCount === 1)
      row += '{{#d6e685}}' + char;
    
    else if (commitCount === 2)
      row += '{{#8cc665}}' + char;
    
    else if (commitCount === 3)
      row += '{{#44a340}}' + char;

    else 
      row += '{{#1e6823}}' + char;
    
    row += ' ';

  });

  return row;
}



function init(){
  async.series([
    
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
    }
  ], function(err){
    getRepoList();
  })
}


init();



