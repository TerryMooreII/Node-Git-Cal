var https = require('https');
var async = require('async');
var xcolor = require('xcolor');
var account = require('./account');

var repos = [];

var commits = [];
var emailAddress = 'terry.moore.ii@gmail.com';


function getCount(){


  var now = new Date(Date.now());
  var daysOfYear = [];

  for (var d = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() ); d <= now; d.setDate(d.getDate() + 1)) {
      daysOfYear.push(new Date(d));
  }


var c = [];
  
  
  for (var j=0; j< daysOfYear.length; j++){
    
    var cd = daysOfYear[j];
    
    var count =0;

    for (var i=0; i< commits.length; i++){
      
      var commit = commits[i];
      
      var d = new Date(commit.getFullYear(), commit.getMonth(), commit.getDate());
      //console.log('%s :: %s', cd, d)
      
      if (cd !== undefined && cd.getTime() === d.getTime()){
      
        count++;
        cd = d;
      }
      else{
        c[cd] = count;
        //break;
      }
      
    }
  }
  
  return c;
 
}
var options = {
   host: 'api.github.com',
   port: 443,
   path: '/user/repos',//'/repos/TerryMooreII/CanvasClock/commits',
   // authentication headers
   headers: {
      'Authorization': 'Basic ' + new Buffer(account.username + ':' + account.password).toString('base64')
   }   
};

//this is the call
request = https.get(options, function(res){
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
        if (err)
          console.log(err);
        commits.sort(function(a,b){
            return a<b ? -1 :a > b ? 1:0;
          });
          var count = getCount();
          showDates(count);
      });      

   });

   res.on('error', function(e) {
      console.log("Got error: " + e.message);
   });
  
});

function getCommits(repo, callback){
  var options = {
   host: 'api.github.com',
   port: 443,
   path: '/repos/TerryMooreII/'+ repo +'/commits',
   // authentication headers
   headers: {
      'Authorization': 'Basic ' + new Buffer("terrymooreii" + ':' + "m0t3rsh0").toString('base64')
   }   
};

//this is the call
request = https.get(options, function(res){
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


function showDates(counts){

  var mon = []; var tues = []; var wed = []; var thurs = []; var fri = []; var sat = []; var sun = [];
  var one = true;
  for (var key in counts){
    if (one){
      one=false
      var firstDay = new Date(key).getDay();      
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
  console.log('')
  console.log(displayMonthTitle(new Date(key).getMonth()))
  xcolor.log('     ' + display(sun, firstDay > 0 ? true : false));
  xcolor.log(' Mon ' + display(mon, firstDay > 1 ? true : false));
  xcolor.log('     ' + display(tues, firstDay > 2 ? true : false));
  xcolor.log(' Wed ' + display(wed, firstDay > 3 ? true : false));
  xcolor.log('     ' + display(thurs, firstDay > 4 ? true : false));
  xcolor.log(' Fri ' + display(fri, firstDay > 5 ? true : false));
  xcolor.log('     ' + display(sat, firstDay > 6 ? true : false));
  console.log('')

}


function displayMonthTitle(firstMon){
  var months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

  var end = 11;
  start = firstMon + 1;
  var stop = false;
  var row='\t    '; 

  for (var i = start; i <= end; i++ ){
    row += months[i] + '\t    ';
  
    if (i === end){
      end2 = start -1;

      for (var j = 0; j <= end2; j++ ){
         row += months[j] + '\t    ';
      }      
    }

  }
  return row;

}

function display(day, spacer){
  var row = '';
  if (spacer)
    row = '  '

  var char = '\u25A9';

  day.forEach(function(d){

    if (d === 0)
      row += '{{#222222}}' + char;

    else if (d === 1)
      row += '{{#d6e685}}' + char;
    
    else if (d === 2)
      row += '{{#8cc665}}' + char;
    
    else if (d === 3)
      row += '{{#44a340}}' + char;

    else 
      row += '{{#1e6823}}' + char;
    
    row += ' ';

  });

  return row;
}







