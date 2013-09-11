class EventsController < ApplicationController
  unloadable
  before_filter :current_project, :current_schedule

  def index
  end

  def new
  end

  def create
    event = current_schedule.events.build do |e|
      e.start_date = params[:start_date]
      e.end_date = params[:end_date]
      e.content = params[:content]
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
    event = Event.find(params[:id])
    event.destroy
    event = current_schedule.events.build do |e|
      e.start_date = params[:start_date]
      e.end_date = params[:end_date]
      e.content = params[:content]
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

  def show
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
end
