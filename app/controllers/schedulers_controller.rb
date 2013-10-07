class SchedulersController < ApplicationController
  unloadable
  before_filter :current_project, :current_schedules, :current_user, :except => [:settings]
  before_filter :login_required, :only => [:home]

  def home
    render :layout => false
  end

  def index
    # [TODO] RedmineのProjectオブジェクトにgroup_by_schedule_idを作る
    events = { }.tap do |license_and_events|
               current_schedules.each do |schedule|
                 license_and_events[schedule.id] = schedule.to_hash_with_events(current_date)
               end
            end

    render :json => events.to_json
  end

  def show
    render :layout => false
  end

  def create
    @schedule = Schedule.new(params[:schedule])
    if @schedule.save
      render :template => "schedulers/create",
             :handlers => [:erb],
             :formats => [:js]
    end
  end

  def update
    schedule = current_schedules.find(params[:id])
    if schedule.update_attributes(title: params[:title], license: params[:license])
      render :json => schedule
    end
  end

  def destroy
    @schedule = current_project.schedules.find(params[:id])
    if @schedule.destroy
      render :template => "schedulers/destroy",
             :handlers => [:erb],
             :formats => [:js]
    end
  end

  def settings
    @plugin = Redmine::Plugin.find(:schedular)

    current_scheduler_setting = SchedulerSetting.first_or_initialize
    if params[:scheduler_setting][:period].to_i < 100
      current_scheduler_setting.period = params[:scheduler_setting][:period]
    end
    current_scheduler_setting.save

    current_custom_list = SchedulerCustomList.current
    current_custom_list.scheduler_setting = SchedulerSetting.first
    current_custom_list.title = params[:scheduler_custom_list][:title]
    current_custom_list.save


    params.select { |p| p.include?("scheduler_custom_list_content") }.each do |_, p|
      SchedulerCustomList.current.scheduler_custom_list_contents.create(p)
    end

    flash[:notice] = l(:notice_successful_update)
    redirect_to plugin_settings_path(@plugin)
  end
end

ApplicationController.class_eval do
  private
  def current_project
    begin
      @project = Project.find(params[:project_id])
    rescue ActiveRecord::RecordNotFound
      render_404
    end
  end

  def current_schedules
    @schedules = current_project.schedules
  end

  def current_schedule
    begin
      @schedule ||= current_project.schedules.find(params[:scheduler_id])
    rescue ActiveRecord::RecordNotFound
      render_404
    end
  end

  def current_date
    if params[:year] and params[:month]
      Date.new(params[:year].to_i, params[:month].to_i)
    else
      Date.new(Time.now.year, Time.now.month)
    end
  end

  def current_user
    User.current = User.find(session[:user_id]) if session[:user_id]
    @curent_user = User.current
  end

  def login_required
    return true if User.current.logged?
    require_login
  end
end
