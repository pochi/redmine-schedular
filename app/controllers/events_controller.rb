class EventsController < ApplicationController
  unloadable
  before_filter :current_project, :current_schedule, :current_user

  def index
  end

  def new
  end

  def create
    event = current_schedule.events.build do |e|
      e.start_date = params[:start_date]
      e.end_date = params[:end_date]
      e.content = params[:content]
      e.user_id = current_user.id
    end
    if event.save
      respond_to do |format|
        format.json { render :json => event }
      end
    else
      respond_to do |format|
        format.json { render :json => event.errors, :status => :unprocessable_entity }
      end
    end
  end

  def update
    ActiveRecord::Base.transaction do
      event = Event.find(params[:id])
      event.destroy
      recreate_event = current_schedule.events.build do |e|
        e.start_date = params[:start_date] || event.start_date
        e.end_date = params[:end_date] || event.end_date
        e.content = params[:content] || event.content
        e.user_id = current_user.id
      end
      recreate_event.save!
      respond_to do |format|
        format.json { render :json => recreate_event }
      end
    end
  rescue => e
    respond_to do |format|
      format.json { render :json => e.inspect, :status => :unprocessable_entity }
    end
  end

  def destroy
    event = Event.find(params[:id])
    if event.destroy
      respond_to do |format|
        format.json { render :json => event }
      end
    else
      respond_to do |format|
        format.json { render :json => event.errors, :status => :unprocessable_entity }
      end
    end
  end

  private
  def current_project
    begin
      @project ||= Project.find(params[:project_id])
    rescue ActiveRecord::RecordNotFound
      render_404
    end
  end

  def current_schedule
    begin
      @schedule ||= current_project.schedules.find(params[:scheduler_id])
    rescue ActiveRecord::RecordNotFound
      render_404
    end
  end

  def current_user
    begin
      @user ||= User.find(session[:user_id])
    rescue ActiveRecord::RecordNotFound
      render_404
    end
  end
end
