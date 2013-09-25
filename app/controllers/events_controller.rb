class EventsController < ApplicationController
  unloadable
  before_filter :current_project, :current_schedule, :current_user

  def create
    event = current_schedule.events.build do |e|
      e.start_date = params[:start_date]
      e.end_date = params[:end_date]
      e.content = params[:content]
      e.user_id = current_user.id
    end
    if event.save
      render :json => event
    else
      render :json => event.errors, :status => :unprocessable_entity
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
      render :json => recreate_event
    end
  rescue => e
    render :json => e.inspect, :status => :unprocessable_entity
  end

  def destroy
    event = Event.find(params[:id])
    if event.destroy
      render :json => event
    else
      render :json => event.errors, :status => :unprocessable_entity
    end
  end
end
