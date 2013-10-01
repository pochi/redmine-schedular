class SchedulerCustomList < ActiveRecord::Base
  unloadable

  belongs_to :scheduler_setting
  has_many :scheduler_custom_list_contents

  class << self
    def current
      self.first_or_initialize
    end
  end
end
