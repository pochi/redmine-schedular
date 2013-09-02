module SchedulerProjectPatch
  def self.included base
    base.class_eval do
      unloadable
      has_many :schedules
    end
  end
end

Project.send(:include, SchedulerProjectPatch)
