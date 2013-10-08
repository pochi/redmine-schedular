
// Angularの設計課題

'use strict';

var calendarApp = angular.module('calendarApp', ['ui.calendar',
                                                 'ui.bootstrap',
                                                 'eventService',
                                                 'eventsService',
                                                 'licenseParticipationService']);

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
    year: '@year',
    month: '@month',
    format: 'json'
  }, {
    query: {
      method: 'GET',
      isArray: true
    }
  });
});

var licenseParticipationService = angular.module('licenseParticipationService', ['ngResource']);
licenseParticipationService.factory("LicenseParticipation", function($resource) {
  return $resource('/projects/:project_id/schedulers/:schedule_id/participations', {
    project_id: '@project_id',
    schedule_id: '@schedule_id',
    format: 'json'
  });
});

calendarApp.value('modalOpts', {
  backdropFade: true,
  dialogFade:true,
  delete: false
});

calendarApp.value('eventHelper', {
  getEventId: function(eventId) {
    var eventIdArray = eventId.split('-');
    return eventIdArray[eventIdArray.length-1];
  }
});

calendarApp.directive("notificationModal", function() {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
      scope.notificationMessage = false;

      scope.notificationClose = function() {
        scope.notificationMessage = false;
      };

      scope.showNotification = function(message) {
        scope.notificationMessage = true;
        scope.notificationMessageContent = message;
      };

      scope.notificationClose = function() {
        scope.notificationMessage = false;
      };
    },
    templateUrl: 'notification.html'
  };
});

calendarApp.directive('eventFormModal', function(Event) {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
    },
    templateUrl: 'event_form.html'
  };
});

calendarApp.directive("licenseList", function(LicenseParticipation) {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
      scope.hiddenLicense = function(license, element) {
        var hidden = function(e, _) {
          var removeIds = [];
          var events = scope.licenses[element.license.id].events;
          for(var i=0;i<events.length;i++)
            removeIds.push(events[i]._id);

          var filter = function(event) {
            for(var i=0; i<removeIds.length; i++) {
              if(removeIds[i] ===  event._id)
                return true;
            }
            return false;
          };
          scope.myCalendar.fullCalendar('removeEvents', filter);
          element.license.visiable = 'hidden-decorator';
        };

        var error = function(response) {
          console.log(response);
          scope.showNotification("リクエストが失敗しました");
        };

        license.$save(hidden, error);
      };

      scope.showLicense = function(license, element) {
        var show = function(e, _) {
          scope.myCalendar.fullCalendar('addEventSource', element.license.events);
          element.license.visiable = 'active';
        };

        var error = function(response) {
          console.log(response);
          scope.showNotification("リクエストが失敗しました");
        };

        license.$delete(show, error);
      };

      scope.switchLicense = function() {
        var licenseParticipation = new LicenseParticipation();
        licenseParticipation.project_id = scope.project_id;
        licenseParticipation.schedule_id = this.license.id;
        var self = this;

        // POST Request
        if (this.license.visiable === 'active') {
          scope.hiddenLicense(licenseParticipation, self);
        } else {
          scope.showLicense(licenseParticipation, self);
        }
      };

      scope.bgstyle = function(color) {
        return {backgroundColor: color};
      };
    },
    templateUrl: "license_list.html"
  };
});



calendarApp.controller('CalendarCtrl', function($scope, $dialog, $location, Event, Events, LicenseParticipation, modalOpts, eventHelper) {
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
  $scope.eventSource = {
    className: "pochi-event"
  };
  $scope.loaded = {
  };
  // Global変数。初回読み込みサーバとはIDのみでやり取りする
  $scope.teams = $("#teams").data("articles");


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
  $scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF];

  // [TODO] Angularの$location.path()が空文字でかえってくる
  // 現在のURLからプロジェクトIDをとってくる
  $scope.project_id = _split_url[_split_url.length - 3];

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
      resource.team = event.team;

      resource.$update(function(e,_) {
        var event = {title: e.event.content,
                     _id: 'event-' + e.event.id,
                     start: e.event.start_date,
                     end: e.event.end_date,
                     team: e.event.team_id,
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
        $scope.showNotification('ライセンス数の上限により、保存できませんでした');
        revert();
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
        $scope.showNotification('ライセンス数の上限により、保存できませんでした');
        revert();
        console.log(response);
      });
    });
  };

  $scope.selectEvent = function(start, end, allDay) {
    $scope.$apply(function() {
      $scope.initializeDialog();
      $scope.setEventDateFromStartAndEnd(start, end);
      $scope.newReservation = true;
      $scope.myCalendar.fullCalendar("unselect");
    });
  };

  $scope.editEvent = function(event) {
    $scope.$apply(function(){
      $scope.updateModalOpts();
      $scope.updateEvent(event);
      $scope.newReservation = true;
    });
  };

  // next button, prev button
  // Event manage
  $scope.viewDisplay = function(view) {
    var currentYear = view.start.getFullYear();
    var currentMonth = view.start.getMonth() + 1;

    if($scope.loaded[currentYear+currentMonth] === undefined) {
      Events.get({project_id: $scope.project_id, year: currentYear, month: currentMonth}, function(schedules, header) {

        angular.forEach(schedules, function(events_per_license, key) {
          var visiableClass = events_per_license.visiable ? 'active' : 'hidden-decorator';
          if($scope.licenses[events_per_license.id] === undefined)
            $scope.licenses[events_per_license.id] = { id: events_per_license.id,
                                                       color: events_per_license.color,
                                                       title: events_per_license.name,
                                                       events: [],
                                                       visiable: visiableClass };

          angular.forEach(events_per_license['events'], function(e) {
            var event = {title: $scope.teams[e.event.team_id] + "-" + e.event.content,
                         _id: 'event-' + e.event.id,
                         start: e.event.start_date,
                         end: e.event.end_date,
                         team: e.event.team_id,
                         className: 'custom-license-event-' + events_per_license.id,
                         backgroundColor: $scope.licenses[events_per_license.id].color,
                         borderColor: 'white'
                        };

            if(events_per_license.visiable)
              $scope.events.push(event);
            $scope.licenses[events_per_license.id].events.push(event);
          });
        });
        console.log($scope.events);
      });
      $scope.loaded[currentYear+currentMonth] = true;
    }
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
      select: $scope.selectEvent,
      eventDrop: $scope.alertOnDrop,
      eventResize: $scope.eventResize,
      eventClick: $scope.editEvent,
      viewDisplay: $scope.viewDisplay,
      weekends: true,
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

  $scope.dialogClose = function() {
    $scope.closeMsg = 'I was closed at: ' + new Date();
    $scope.newReservation = false;
    $scope.alertEventMessage = '';
  };

  $scope.deleteEvent = function() {
    var resource = $scope.replaceEventModelFrom(this);
    resource.$delete(function(e, _){
      $scope.afterDelete(e);
    }, function error(response) {
        console.log(response);
    });
  };

  $scope.createEvent = function(newEvent) {
    var resource = $scope.replaceEventModelFrom(newEvent);
    if (!resource.event_id) {
      resource.$save(function(e, _) {
        $scope.afterCreate(e);
      }, function error(response) {
        $scope.alertEventMessage = 'ライセンス数の上限を超えています';
      });
    } else {
      resource.$update(function(e,_) {
        $scope.afterUpdate(e, newEvent.eventId);
      }, function error(response) {
        console.log(response);
      });
    }
  };

  // Event update of $scope.
  // Follow methods are private methods.
  $scope.replaceEventModelFrom = function(event) {
    var resource = new Event();
    resource.project_id = $scope.project_id;
    resource.event_id = event.eventId;
    resource.schedule_id = event.license;
    resource.start_date = event.startYear + "-" + event.startMonth + "-" + event.startDate;
    resource.end_date = event.endYear + "-" + event.endMonth + "-" + event.endDate;
    resource.content = event.content;
    resource.team_id = event.team;
    return resource;
  };

  $scope.updateModalOpts = function() {
    $scope.modalOpts.title = '更新';
    $scope.modalOpts.submitText = '更新';
    $scope.modalOpts.delete = true;
  };

  $scope.updateEvent = function(event) {
    $scope.eventId = eventHelper.getEventId(event._id);
    $scope.setEventDate(event);
    $scope.title = event.title;
    $scope.team = event.team;
    console.log(event);

    var customEventArray = event.className[0].split('-');
    $scope.license = customEventArray[customEventArray.length-1];
  };

  $scope.setEventDate = function(event) {
    if(event.end === null)
      event.end = event.start;
    $scope.setEventDateFromStartAndEnd(event.start, event.end);
  };

  $scope.setEventDateFromStartAndEnd = function(start, end) {
    $scope.startYear = start.getFullYear();
    $scope.startMonth = start.getMonth() + 1;
    $scope.startDate = start.getDate();
    $scope.endYear = end.getFullYear();
    $scope.endMonth = end.getMonth() + 1;
    $scope.endDate = end.getDate();
  };

  // resource event callback
  $scope.afterCreate = function(e) {
    var event = {title: e.event.content,
                 _id: 'event-' + e.event.id,
                 start: e.event.start_date,
                 end: e.event.end_date,
                 team: e.event.team_id,
                 backgroundColor: $scope.licenses[e.event.schedule_id].color,
                 className: 'custom-license-event-' + e.event.schedule_id,
                 borderColor: 'white'
                };
    $scope.myCalendar.fullCalendar("renderEvent", event,  true);
    $scope.licenses[e.event.schedule_id].events.push(event);
    $scope.newReservation = false;
  };

  $scope.afterDelete = function(e) {
    var replaceEvents = [];
    var currentEvents = $scope.licenses[e.event.schedule_id].events;
    for(var i=0;i<currentEvents;i++) {
      if (currentEvents[i]._id !== 'event-' + e.event.id)
        replaceEvents.push(currentEvents[i]);
    }
    $scope.myCalendar.fullCalendar("removeEvents", 'event-' + e.event.id);
    $scope.licenses[e.event.schedule_id].events = replaceEvents;
    $scope.licenses[e.event.schedule_id].events.push(e.event);
    $scope.dialogClose();
    $scope.showNotification('予定を削除しました');
  };

  $scope.afterUpdate = function(e, beforeEventId) {
    var event = {title: e.event.content,
                 _id: 'event-' + e.event.id,
                 start: e.event.start_date,
                 end: e.event.end_date,
                 backgroundColor: $scope.licenses[e.event.schedule_id].color,
                 className: 'custom-license-event-' + e.event.schedule_id,
                 borderColor: 'white'
                };
    $scope.myCalendar.fullCalendar("removeEvents", 'event-' + beforeEventId);
    $scope.myCalendar.fullCalendar("renderEvent", event,  true);
    var replaceEvents = [];
    var currentEvents = $scope.licenses[e.event.schedule_id].events;
    for(var i=0;i<currentEvents;i++) {
      if (currentEvents[i]._id !== 'event-' + beforeEventId)
        replaceEvents.push(currentEvents[i]);
    }
    $scope.licenses[e.event.schedule_id].events = replaceEvents;
    $scope.licenses[e.event.schedule_id].events.push(event);
    $scope.newReservation = false;
  };

  $scope.dateIsNotFilled = function(event) {
    if(!event.endDate)
      return true;
    if(!event.endMonth)
      return true;
    if(!event.endYear)
      return true;
    if(!event.startDate)
      return true;
    if(!event.startMonth)
      return true;
    if(!event.startYear)
      return true;

    return false;
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
