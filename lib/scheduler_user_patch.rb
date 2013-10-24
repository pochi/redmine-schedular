module SchedulerUserPatch
  def self.included base
    base.class_eval do
      unloadable
      has_many :events
    end
  end
end

User.send(:include, SchedulerUserPatch)
