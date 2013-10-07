class SchedulerSetting < ActiveRecord::Base
  unloadable

  has_one :scheduler_custom_list

  def self.current
    self.first_or_initialize
  end
end
