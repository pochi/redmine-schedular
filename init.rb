require 'redmine'
require 'scheduler_application_controller_patch'
require 'scheduler_projects_helper_patch'
require 'scheduler_projects_patch'
require 'scheduler_user_patch'
require 'scheduler_version'

Redmine::Plugin.register :schedular do
  name 'Schedular plugin'
  author 'pochi_black'
  description 'This is a plugin for Redmine like Google calendar'
  version SchedulerPlugin::VERSION
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
    require_dependency 'user'

    unless ApplicationController.included_modules.include? SchedulerApplicationControllerPatch
      ApplicationController.send(:include, SchedulerApplicationControllerPatch)
    end

    unless ProjectsHelper.included_modules.include? SchedulerProjectsHelperPatch
      ProjectsHelper.send(:include, SchedulerProjectsHelperPatch)
    end

    unless Project.included_modules.include? SchedulerProjectPatch
      Project.send(:include, SchedulerProjectPatch)
    end

    unless User.included_modules.include? SchedulerUserPatch
      User.send(:include, SchedulerUserPatch)
    end
  end
end
