// Angularの設計課題

'use strict';

var calendarApp = angular.module('calendarApp', ['ui.calendar', 'ui.bootstrap','eventService', 'eventsService']);

calendarApp.run(function($rootScope, $location) {
  $rootScope.location = $location;
});

var eventService = angular.module('eventService', ['ngResource']);
eventService.factory('Event', function($resource) {
  return $resource('/projects/:project_id/schedulers/:scheduler_id/events', {
    project_id: '@project_id',
    scheduler_id: '@scheduler_id',
    format: 'json'
  }, {
  });
});

var eventsService = angular.module('eventsService', ['ngResource']);
eventsService.factory('Events', function($resource) {
  return $resource('/projects/:project_id/schedulers/', {
    project_id: '@project_id',
    format: 'json'
  }, {
    query: {
      method: 'GET',
      isArray: true
    }
  });
});

calendarApp.value('modalOpts', {
  backdropFade: true,
  dialogFade:true
});

calendarApp.controller('CalendarCtrl', function($scope, $dialog, $location, Event, Events, modalOpts) {
  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();
  var _split_url = location.href.split("/");
  var current_date = new Date(y,m,1);
  var initial_events = [];
  $scope.licenses = {
  };

    // [TODO] Angularの$location.path()が空文字でかえってくる
  // 現在のURLからプロジェクトIDをとってくる
  $scope.project_id = _split_url[_split_url.length - 3];
  Events.get({project_id: $scope.project_id}, function(schedules, header) {
    angular.forEach(schedules, function(events_per_license, key) {
      $scope.licenses[events_per_license['id']] = events_per_license['color'];
      angular.forEach(events_per_license['events'], function(e) {
        initial_events.push({title: e.event.content,
                                  start: e.event.start_date,
                                  end: e.event.end_date,
                                  className: 'pochi-event',
                                  backgroundColor: $scope.licenses[events_per_license['id']],
                                  borderColor: 'white'
                            });
      });
    });
  });

  $scope.option_years = [];
  for(var i=y-5;i<=y+5;i++) {
    $scope.option_years.push(i);
  }

  $scope.option_months = [];
  for(var i=0;i<=12;i++) {
    $scope.option_months.push(i);
  }

  $scope.option_days = [];
  for(var i=0;i<=31;i++) {
    $scope.option_days.push(i);
  }

  $scope.events = initial_events;
  $scope.eventSource = {
    className: "pochi-event"
  };

  $scope.eventsF = function(start, end, callback) {
    var s = new Date(start).getTime() / 1000;
    var e = new Date(end).getTime() / 1000;
    var m = new Date(start).getMonth();
    var events = [
      {
        title: 'sample',
        allDay: true
      }
    ];
    callback(events);
  };

  $scope.alertEventOnClick = function(date, allDay, event, view) {
    $scope.$apply(function(){
      $scope.alertMessage = '予約が完了しました';
    });
  };

  $scope.alertOnDropk = function(event, day, minute, allDay, revert, js, ui, view) {
    $scope.$apply(function(){
      $scope.alertMessage = 'event';
    });
  };

  $scope.alertOnResize = function(event, day, minute, revert, js, ui, view) {
    $scope.$apply(function(){
      $scope.alertMessage = 'event';
    });
  };

  $scope.changeView = function(view) {
    $scope.myCalendar.fullCalendar('changeView', view);
  };

  $scope.selectEvent = function(start, end, allDay) {
    var title;
    $scope.startYear = start.getFullYear();
    $scope.startMonth = start.getMonth() + 1;
    $scope.startDate = start.getDate();

    $scope.endYear = end.getFullYear();
    $scope.endMonth = end.getMonth() + 1;
    $scope.endDate = end.getDate();

    $scope.newReservation = true;
    if (title) {
      $scope.myCalendar.fullCalendar("renderEvent", {
        title: title,
        start: start,
        end: end,
        allDay: true,
        backgroundColor: "rgb(179, 220, 108)"
       }, true);
    }
    $scope.myCalendar.fullCalendar("unselect");

    $scope.$apply(function() {
      console.log(start);
    });
  };

  // http://iw3.me/156/
  $scope.uiConfig = {
    calendar:{
      height: 450,
      editable: true,
      header: {
        left: 'today prev, next, title',
        center :'',
        right: ''
      },
      dayClick: $scope.alertEventOnClick,
      eventDrop: $scope.alertOnDrop,
      eventResize: $scope.alertOnResize,
      select: $scope.selectEvent,
      weekends: false,
      firstDay: 1,
      selectable: true,
      selectHelper: true,
      // 月名称
      monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      // 月略称
      monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      // 曜日名称
      dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
      // 曜日略称
      dayNamesShort: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
      // ボタン文字列
      buttonText: {
          prev:     '&lsaquo;', // <
          next:     '&rsaquo;', // >
          prevYear: '&laquo;',  // <<
          nextYear: '&raquo;',  // >>
          today:    '今月',
          month:    '月',
          week:     '週',
          day:      '日'
      },
      // タイトルの書式
      titleFormat: {
          month: 'yyyy年M月',                             // 2013年9月
          week: "yyyy年M月d日{ ～ }{[yyyy年]}{[M月]d日}",  // 2013年9月7日 ～ 13日
          day: "yyyy年M月d日'('ddd')'"                    // 2013年9月7日(火)
      }
    }
  };

  $scope.modalOpts = modalOpts;
  $scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF];

  $scope.activate_calendar = function(name) {
    alert("pochi");
    console.log($scope.sourceCalendar);
  };

  $scope.items = ["item2"];

  $scope.dialogOpen = function() {
    $scope.newReservation = true;
  };

  $scope.dialogClose = function() {
    $scope.closeMsg = 'I was closed at: ' + new Date();
    $scope.newReservation = false;
    $scope.alertEventMessage = '';
  };

  $scope.createEvent = function(newEvent) {
    var resource = new Event();
    resource.project_id = $scope.project_id;
    resource.scheduler_id = newEvent.license;
    resource.start_date = newEvent.startYear + "-" + newEvent.startMonth + "-" + newEvent.startDate;
    resource.end_date = newEvent.endYear + "-" + newEvent.endMonth + "-" + newEvent.endDate;
    resource.content = newEvent.content;

    resource.$save(function(e, _) {
      $scope.myCalendar.fullCalendar("renderEvent", {
        title: e.event.content,
        start: e.event.start_date,
        end: e.event.end_date,
        allDay: true,
        backgroundColor: $scope.licenses[e.event.schedule_id],
        borderColor: 'white'
       }, true);
      $scope.newReservation = false;
    }, function error(response) {
      $scope.alertEventMessage = 'ライセンス数の上限を超えています';
      console.log(response);
    });
  };
});

// ng-model以外のイベントはこっちでやる。
$(function(){
  $("td.fc-day").hover(function() {
    $(this).addClass("fc-state-highlight");
  }, function(){
    $(this).removeClass("fc-state-highlight");
  });
});