module SchedulersHelper
  def team_options
    options = []
    SchedulerCustomList.current.scheduler_custom_list_contents.map do |content|
      options << [content.name, content.id]
    end
    options_for_select(options)
  end
end
