require 'redmine'
require 'scheduler_projects_helper_patch'
require 'scheduler_projects_patch'
require 'scheduler_version'

Redmine::Plugin.register :schedular do
  name 'Schedular plugin'
  author 'pochi_black'
  description 'This is a plugin for Redmine like Google calendar'
  version '0.0.1'
  url 'http://github.com/pochi/redmine_schedular'
  author_url 'http://github.com/pochi/'

  settings :default => {}, :partial => 'settings/scheduler_settings'

  project_module :schedular do
    permission :scheduler, { :schedulers => [:index, :new, :edit, :show, :home]}, public: true
  end

  menu :project_menu, :schedular, { :controller => 'schedulers', :action => 'home' },
                                  caption: 'リソース予約',
                                  after: :repository,
                                  param: :project_id,
                                  html: { :target => '_blank' }


  Rails.configuration.to_prepare do
    require_dependency 'projects_helper'
    unless ProjectsHelper.included_modules.include? SchedulerProjectsHelperPatch
      ProjectsHelper.send(:include, SchedulerProjectsHelperPatch)
    end

    unless Project.included_modules.include? SchedulerProjectPatch
      Project.send(:include, SchedulerProjectPatch)
    end
  end
end
