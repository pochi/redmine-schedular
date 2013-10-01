class SchedulerCustomListContent < ActiveRecord::Base
  unloadable

  belongs_to :scheduler_custom_list
  validates_presence_of :name
end
