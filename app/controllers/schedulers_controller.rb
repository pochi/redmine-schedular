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
    permitted_params= params.require(:schedule).permit(:id, :project_id, :title,:license, :color)
    @schedule = Schedule.new(permitted_params)
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
end
