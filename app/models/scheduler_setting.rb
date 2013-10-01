class SchedulerSetting < ActiveRecord::Base
  unloadable

  has_one :scheduler_custom_list
end
