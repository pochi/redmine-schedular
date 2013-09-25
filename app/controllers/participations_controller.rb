class ParticipationsController < ApplicationController
  unloadable
  before_filter :current_project, :current_schedule, :current_user

  def create
    participation = current_schedule.license_participations.build(:user_id => current_user.id)

    if participation.save
      render :json => participation
    else
      render :json => participation.errors, :status => :unprocessable_entity
    end
  end

  def destroy
    participation = current_schedule.license_participations
                                    .find_by_user_id(current_user.id)

    if participation && participation.destroy
      render :json => participation
    else
      render :json => participation.errors, :status => :unprocessable_entity
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
