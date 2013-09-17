
// Angularの設計課題

'use strict';

var calendarApp = angular.module('calendarApp', ['ui.calendar', 'ui.bootstrap','eventService', 'eventsService']);

calendarApp.config([
  "$httpProvider", function($httpProvider) {
    $httpProvider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
  }
]);

calendarApp.run(function($rootScope, $location) {
  $rootScope.location = $location;
});

var eventService = angular.module('eventService', ['ngResource']);
eventService.factory('Event', function($resource) {
  return $resource('/projects/:project_id/schedulers/:schedule_id/events/:event_id', {
    project_id: '@project_id',
    schedule_id: '@schedule_id',
    event_id: '@event_id',
    format: 'json'
  }, {
    update: {
      method: 'PUT'
    }
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
  dialogFade:true,
  delete: false
});

calendarApp.controller('CalendarCtrl', function($scope, $dialog, $location, Event, Events, modalOpts) {
  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();
  var _split_url = location.href.split("/");
  var current_date = new Date(y,m,1);
  $scope.licenses = {
  };
  $scope.events = [];
  $scope.newReservation = false;
  $scope.updateEvent = false;

  // [TODO] Angularの$location.path()が空文字でかえってくる
  // 現在のURLからプロジェクトIDをとってくる
  $scope.project_id = _split_url[_split_url.length - 3];
  Events.get({project_id: $scope.project_id}, function(schedules, header) {
      angular.forEach(schedules, function(events_per_license, key) {
      $scope.licenses[events_per_license.id] = { id: events_per_license.id,
                                                 color: events_per_license.color,
                                                 title: events_per_license.name,
                                                 events: [],
                                                 visiable: 'active' };

      angular.forEach(events_per_license['events'], function(e) {
        var event = {title: e.event.content,
                     _id: 'event-' + e.event.id,
                     start: e.event.start_date,
                     end: e.event.end_date,
                     className: 'custom-license-event-' + events_per_license.id,
                     backgroundColor: $scope.licenses[events_per_license.id].color,
                     borderColor: 'white'
                    };
        $scope.events.push(event);
        $scope.licenses[events_per_license.id].events.push(event);
      });
    });
    console.log($scope.events);
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

  $scope.alertOnDrop = function(event, day, minute, allDay, revert, js, ui, view) {
    $scope.$apply(function(){
      var currentEventId = event._id;

      var resource = new Event();
      resource.project_id = $scope.project_id;
      var eventIdArray = event._id.split("-");
      var scheduleIdArray = event.className[0].split("-");
      resource.event_id = eventIdArray[eventIdArray.length-1];
      resource.schedule_id = scheduleIdArray[scheduleIdArray.length-1];

      resource.start_date = event.start.getFullYear() + "-" + (event.start.getMonth() + 1) + "-" + event.start.getDate();
      if(event.end !== null) {
        resource.end_date = event.end.getFullYear() + "-" + (event.end.getMonth() + 1) + "-" + event.end.getDate();
      } else {
        resource.end_date  = resource.start_date;
      }

      resource.$update(function(e,_) {
        var event = {title: e.event.content,
                     _id: 'event-' + e.event.id,
                     start: e.event.start_date,
                     end: e.event.end_date,
                     backgroundColor: $scope.licenses[e.event.schedule_id].color,
                     className: 'custom-license-event-' + e.event.schedule_id,
                     borderColor: 'white'
                    };
        $scope.myCalendar.fullCalendar("removeEvents", currentEventId);
        $scope.myCalendar.fullCalendar("renderEvent", event,  true);
        var replaceEvents = [];
        var currentEvents = $scope.licenses[e.event.schedule_id].events;
        for(var i=0;i<currentEvents;i++) {
          if (currentEvents[i]._id !== currentEventId)
            replaceEvents.push(currentEvents[i]);
        }
        $scope.licenses[e.event.schedule_id].events = replaceEvents;
        $scope.licenses[e.event.schedule_id].events.push(event);
        $scope.newReservation = false;
      }, function error(response) {
        console.log(response);
      });
    });
  };

  $scope.eventResize = function(event, day, minute, revert, js, ui, view) {
    $scope.$apply(function(){
      var currentEventId = event._id;

      var resource = new Event();
      resource.project_id = $scope.project_id;
      var eventIdArray = event._id.split("-");
      var scheduleIdArray = event.className[0].split("-");
      resource.event_id = eventIdArray[eventIdArray.length-1];
      resource.schedule_id = scheduleIdArray[scheduleIdArray.length-1];

      resource.start_date = event.start.getFullYear() + "-" + (event.start.getMonth() + 1) + "-" + event.start.getDate();
      if(event.end !== null) {
        resource.end_date = event.end.getFullYear() + "-" + (event.end.getMonth() + 1) + "-" + event.end.getDate();
      } else {
        resource.end_date  = resource.start_date;
      }

      resource.$update(function(e,_) {
        var event = {title: e.event.content,
                     _id: 'event-' + e.event.id,
                     start: e.event.start_date,
                     end: e.event.end_date,
                     backgroundColor: $scope.licenses[e.event.schedule_id].color,
                     className: 'custom-license-event-' + e.event.schedule_id,
                     borderColor: 'white'
                    };
        $scope.myCalendar.fullCalendar("removeEvents", currentEventId);
        $scope.myCalendar.fullCalendar("renderEvent", event,  true);
        var replaceEvents = [];
        var currentEvents = $scope.licenses[e.event.schedule_id].events;
        for(var i=0;i<currentEvents;i++) {
          if (currentEvents[i]._id !== currentEventId)
            replaceEvents.push(currentEvents[i]);
        }
        $scope.licenses[e.event.schedule_id].events = replaceEvents;
        $scope.licenses[e.event.schedule_id].events.push(event);
        $scope.newReservation = false;
      }, function error(response) {
        console.log(response);
      });
    });
  };

  $scope.changeView = function(view) {
    console.log("calendar-------------------");
    $scope.myCalendar.fullCalendar('changeView', view);
  };

  $scope.selectEvent = function(start, end, allDay) {
    $scope.initializeDialog();

    $scope.startYear = start.getFullYear();
    $scope.startMonth = start.getMonth() + 1;
    $scope.startDate = start.getDate();

    $scope.endYear = end.getFullYear();
    $scope.endMonth = end.getMonth() + 1;
    $scope.endDate = end.getDate();

    $scope.newReservation = true;
    $scope.myCalendar.fullCalendar("unselect");
    $scope.$apply(function() {
      console.log(start);
    });
  };

  $scope.editEvent = function(event) {
    $scope.$apply(function(){
      $scope.modalOpts.title = '更新';
      $scope.modalOpts.submitText = '更新';
      $scope.modalOpts.delete = true;

      if(event.end === null)
        event.end = event.start;

      var eventIdArray = event._id.split('-');
      $scope.eventId = eventIdArray[eventIdArray.length-1];
      $scope.startYear = event.start.getFullYear();
      $scope.startMonth = event.start.getMonth() + 1;
      $scope.startDate = event.start.getDate();

      $scope.endYear = event.end.getFullYear();
      $scope.endMonth = event.end.getMonth() + 1;
      $scope.endDate = event.end.getDate();

      $scope.title = event.title;
      var customEventArray = event.className[0].split('-');
      $scope.license = customEventArray[customEventArray.length-1];
      console.log($scope.license);
      $scope.newReservation = true;
    });
  };

  // http://iw3.me/156/
  $scope.uiConfig = {
    calendar:{
      height: 450,
      editable: true,
      dropable: true,
      header: {
        left: 'today prev, next, title',
        center :'',
        right: ''
      },
      dayClick: $scope.alertEventOnClick,
      select: $scope.selectEvent,
      eventDrop: $scope.alertOnDrop,
      eventResize: $scope.eventResize,
      eventClick: $scope.editEvent,
      prev: $scope.prevEvent,
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

  $scope.dialogOpen = function() {
    $scope.initializeDialog();
    $scope.newReservation = true;
  };

  $scope.initializeDialog = function() {
    $scope.modalOpts.title = '新規予約';
    $scope.modalOpts.submitText = '作成';
    $scope.modalOpts.delete = false;
    $scope.title = null;
    $scope.license = null;
    $scope.eventId = null;
    $scope.startYear = null;
    $scope.startMonth = null;
    $scope.startDate = null;
    $scope.endYear = null;
    $scope.endMonth = null;
    $scope.endDate = null;
  };

  $scope.switchLicense = function() {
    if (this.license.visiable === 'active') {
      var removeIds = [];
      var events = $scope.licenses[this.license.id].events;
      for(var i=0;i<events.length;i++) {
        console.log(events[i]);
        removeIds.push(events[i]._id);
      }
      var filter = function(e) {
        for(var i=0; i<removeIds.length; i++) {
          if(removeIds[i] ===  e._id)
            return true;
        }
        return false;
      };
      $scope.myCalendar.fullCalendar('removeEvents', filter);
      this.license.visiable = 'hidden-decorator';
    } else {
      $scope.myCalendar.fullCalendar('addEventSource', this.license.events);
      this.license.visiable = 'active';
    }
  };

  $scope.dialogClose = function() {
    $scope.closeMsg = 'I was closed at: ' + new Date();
    $scope.newReservation = false;
    $scope.alertEventMessage = '';
  };

  $scope.prevEvent = function() {
    console.log("hogeevent");
  };

  $scope.deleteEvent = function() {
    console.log(this);
    var resource = new Event();
    resource.project_id = this.project_id;
    resource.schedule_id = this.license;
    resource.event_id = this.eventId;
    resource.$delete(function(e, _){
      var replaceEvents = [];
      var currentEvents = $scope.licenses[e.event.schedule_id].events;
      for(var i=0;i<currentEvents;i++) {
        if (currentEvents[i]._id !== 'event-' + e.event.id)
          replaceEvents.push(currentEvents[i]);
      }
      $scope.myCalendar.fullCalendar("removeEvents", 'event-' + e.event.id);
      $scope.licenses[e.event.schedule_id].events = replaceEvents;
      $scope.licenses[e.event.schedule_id].events.push(event);
      $scope.newReservation = false;
    });
  };

  $scope.createEvent = function(newEvent) {
    var resource = new Event();
    resource.project_id = $scope.project_id;
    resource.schedule_id = newEvent.license;
    resource.start_date = newEvent.startYear + "-" + newEvent.startMonth + "-" + newEvent.startDate;
    resource.end_date = newEvent.endYear + "-" + newEvent.endMonth + "-" + newEvent.endDate;
    resource.content = newEvent.content;

    if (!newEvent.eventId) {
      resource.$save(function(e, _) {
        var event = {title: e.event.content,
                     _id: 'event-' + e.event.id,
                     start: e.event.start_date,
                     end: e.event.end_date,
                     backgroundColor: $scope.licenses[e.event.schedule_id].color,
                     className: 'custom-license-event-' + e.event.schedule_id,
                     borderColor: 'white'
                    };
        $scope.myCalendar.fullCalendar("renderEvent", event,  true);
        $scope.licenses[e.event.schedule_id].events.push(event);
        $scope.newReservation = false;
      }, function error(response) {
        $scope.alertEventMessage = 'ライセンス数の上限を超えています';
        console.log(response);
      });
    } else {
      resource.event_id = newEvent.eventId;

      resource.$update(function(e,_) {
        var event = {title: e.event.content,
                     _id: 'event-' + e.event.id,
                     start: e.event.start_date,
                     end: e.event.end_date,
                     backgroundColor: $scope.licenses[e.event.schedule_id].color,
                     className: 'custom-license-event-' + e.event.schedule_id,
                     borderColor: 'white'
                    };
        $scope.myCalendar.fullCalendar("removeEvents", 'event-' + newEvent.eventId);
        $scope.myCalendar.fullCalendar("renderEvent", event,  true);
        var replaceEvents = [];
        var currentEvents = $scope.licenses[e.event.schedule_id].events;
        for(var i=0;i<currentEvents;i++) {
          if (currentEvents[i]._id !== 'event-' + newEvent.eventId)
            replaceEvents.push(currentEvents[i]);
        }
        $scope.licenses[e.event.schedule_id].events = replaceEvents;
        $scope.licenses[e.event.schedule_id].events.push(event);
        $scope.newReservation = false;
      }, function error(response) {
        console.log(response);
      });
    }
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