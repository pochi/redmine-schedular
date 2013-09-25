class ParticipationsController < ApplicationController
  unloadable
  before_filter :current_project, :current_schedule


  def create
    logger.info "hoge"*20
  end

  def destroy
  end

  private
  def login_required
    return true if User.current.logged?
    require_login
  end
end
