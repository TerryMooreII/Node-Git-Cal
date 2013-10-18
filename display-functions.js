var xcolor    = require('xcolor');



exports.sortCommitsByDayOfWeek = function (counts){

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

exports.display = function (commitsByDayOfWeek){
  
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


var displayMonthTitle =function (){
  var months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

  var date = new Date();
  var end = 11; //Months are zero based
  var start = date.getMonth();
  var stop = false;
  var row='     '; 
  var monthSpacer = '      ';
  var firstMonthSpacer = '  ';
  var isFirstMonth = true;
  
  if (date.getDate() > 20){ //Terible hack, sorry
    start++;
    isFirstMonth = false;
    row += monthSpacer;
  }

  for (var i = start; i <= end; i++ ){

    row += months[i] + (isFirstMonth ? firstMonthSpacer : monthSpacer);
    isFirstMonth = false;
    if (i === end){
      var end2 = start - 1;

      for (var j = 0; j <= end2; j++ ){
         row += months[j] + monthSpacer;
      }      
    }
  }
  return row;

}

var displayCommits = function (day, spacer){
 
  var row = '';
  
  //Leaves a blank space to line up the days
  if (spacer)
    row = '  '

  var char = '\u25A9'; //square
  
  day.forEach(function(commitCount){

    if (commitCount === 0)
      row += '{{#212121}}' + char;

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


exports.mergeDatesAndCommits = function(commits){
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
    var numOfCommits = 0;

    for (var i=0; i<commits.length; i++){
      
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




