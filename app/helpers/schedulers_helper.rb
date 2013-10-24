module SchedulersHelper
  def team_options
    options = []
    SchedulerCustomList.current.scheduler_custom_list_contents.map do |content|
      options << [content.name, content.id]
    end
    options_for_select(options)
  end

  def license_options(schedules)
    options = []
    schedules.each do |schedule|
      options << [schedule.title, schedule.id]
    end
    options_for_select(options)
  end

  def teams
    teams_hash = { }
    SchedulerCustomListContent.all.each do |content|
      teams_hash[content.id] = content.name
    end
    teams_hash.to_json
  end

  def max_period
    { :period => SchedulerSetting.current.period }.to_json
  end

  def last_event
    empty_event = { :event => { } }
    (User.current.events.order('updated_at desc').first || empty_event).to_json
  end
end
