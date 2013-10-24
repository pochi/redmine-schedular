require_dependency 'projects_helper'

module SchedulerProjectsHelperPatch
  def self.included base
    base.send :include, ProjectsHelperMethodsScheduler
    base.class_eval do
      alias_method_chain :project_settings_tabs, :scheduler
    end
  end
end

module ProjectsHelperMethodsScheduler
  def project_settings_tabs_with_scheduler
    tabs = project_settings_tabs_without_scheduler
    action = { name: 'scheduler',
               controller: 'schedulers',
               action: 'index',
               partial: 'schedulers/index', :label => :schedulers }

    tabs.tap { |t| t << action if User.current.allowed_to?(action, @project) }
  end
end

ProjectsHelper.send(:include, SchedulerProjectsHelperPatch)
