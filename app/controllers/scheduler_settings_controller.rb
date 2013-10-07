class SchedulerSettingsController < ApplicationController
  unloadable

  def update
    scheduler_setting = SchedulerSetting.current
    period = params[:period].to_i
    if period < 100 and scheduler_setting.update_attributes(:period => period)
      render :json => scheduler_setting
    end
  end
end
